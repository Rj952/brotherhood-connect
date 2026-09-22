import Anthropic from "@anthropic-ai/sdk";
import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import {
  MENTOR_MODEL,
  MODE_IDS,
  SYSTEM_PROMPT,
  MAX_FIELD_CHARS,
  MAX_TOTAL_CHARS,
  buildInitialMessage,
} from "@/lib/mentor";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_FOLLOW_UPS = 20;

const client = new Anthropic();

function accessCodeValid(given) {
  const expected = process.env.ACCESS_CODE;
  if (!expected) return true;
  const a = Buffer.from(String(given || ""));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// history = follow-up turns after the initial submission:
// [assistant, user, assistant, user, ...] ending with a user turn.
function validateHistory(history) {
  if (!Array.isArray(history)) return "history must be an array";
  if (history.length > MAX_FOLLOW_UPS * 2) return "This conversation is too long — start a new review.";
  for (let i = 0; i < history.length; i++) {
    const turn = history[i];
    const expectedRole = i % 2 === 0 ? "assistant" : "user";
    if (turn?.role !== expectedRole || typeof turn.content !== "string" || !turn.content.trim()) {
      return "Invalid conversation history";
    }
    if (turn.content.length > MAX_FIELD_CHARS) return "A message is too long";
  }
  if (history.length % 2 !== 0) return "Conversation must end with a student question";
  return null;
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { mode, details = {}, history = [], accessCode } = body;

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return NextResponse.json({ error: "The mentor isn't configured yet: set ANTHROPIC_API_KEY on the server." }, { status: 500 });
  }

  if (!accessCodeValid(accessCode)) {
    return NextResponse.json({ error: "Incorrect access code" }, { status: 401 });
  }
  if (!MODE_IDS.includes(mode)) {
    return NextResponse.json({ error: "Unknown feedback type" }, { status: 400 });
  }
  const values = Object.values(details).filter((v) => typeof v === "string");
  if (values.some((v) => v.length > MAX_FIELD_CHARS) || values.join("").length > MAX_TOTAL_CHARS) {
    return NextResponse.json({ error: "Submission is too long — trim it or send one section at a time." }, { status: 400 });
  }
  if (!details.title?.trim() && !details.proposal?.trim() && !details.questions?.trim()) {
    return NextResponse.json({ error: "Add at least a topic, research questions or proposal text." }, { status: 400 });
  }
  const historyError = validateHistory(history);
  if (historyError) return NextResponse.json({ error: historyError }, { status: 400 });

  const messages = [{ role: "user", content: buildInitialMessage(mode, details) }, ...history];

  const stream = client.beta.messages.stream({
    model: MENTOR_MODEL,
    max_tokens: 32000,
    system: SYSTEM_PROMPT,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    // Cache the conversation prefix so follow-up questions don't re-bill the whole proposal.
    cache_control: { type: "ephemeral" },
    // If a safety classifier declines, the API retries on Anthropic's recommended fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\n_The mentor couldn't respond to this request. Try rephrasing or sending a different section._"));
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\n_Response cut off — ask the mentor to continue._"));
        }
      } catch (error) {
        let message = "Something went wrong generating feedback. Please try again.";
        if (error instanceof Anthropic.AuthenticationError) message = "The server's Claude API key is missing or invalid.";
        else if (error instanceof Anthropic.RateLimitError) message = "The mentor is busy right now — please try again in a minute.";
        else if (error instanceof Anthropic.APIError) console.error(`Claude API error ${error.status}:`, error.message);
        else console.error(error);
        controller.enqueue(encoder.encode(`\n\n⚠️ ${message}`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
