"use client";
import { useEffect, useRef, useState } from "react";
import Markdown from "@/app/components/Markdown";
import { MODES, LEVELS, PARADIGMS, APPROACHES } from "@/lib/mentor";

const EMPTY = {
  level: LEVELS[1],
  discipline: "",
  title: "",
  problem: "",
  purpose: "",
  questions: "",
  paradigm: PARADIGMS[0],
  approach: APPROACHES[0],
  framework: "",
  methods: "",
  proposal: "",
  concerns: "",
};

// Which optional fields each mode shows (topic, level and discipline always show).
const MODE_FIELDS = {
  topic: ["problem", "concerns"],
  questions: ["problem", "purpose", "questions", "approach", "concerns"],
  paradigm: ["problem", "purpose", "questions", "paradigm", "approach", "framework", "methods", "concerns"],
  methodology: ["purpose", "questions", "paradigm", "approach", "methods", "concerns"],
  proposal: ["paradigm", "approach", "proposal", "concerns"],
  framework: ["questions", "paradigm", "framework", "proposal", "concerns"],
};

const TEXT_FIELDS = {
  problem: { label: "Problem statement", rows: 4, hint: "What problem or gap does your study address, and what evidence shows it matters?" },
  purpose: { label: "Purpose statement", rows: 3, hint: "The purpose of this study is to…" },
  questions: { label: "Research questions / hypotheses", rows: 4, hint: "RQ1: …\nRQ2: …" },
  framework: { label: "Theoretical / conceptual framework", rows: 3, hint: "The theory or model and how you plan to use it" },
  methods: { label: "Methodology & methods", rows: 6, hint: "Design, participants and sampling, data collection, analysis, ethics" },
  proposal: { label: "Proposal text", rows: 14, hint: "Paste your proposal or chapter(s) here" },
  concerns: { label: "What do you most want feedback on?", rows: 2, hint: "e.g. My supervisor says my questions don't match my methodology" },
};

export default function Home() {
  const [mode, setMode] = useState("paradigm");
  const [details, setDetails] = useState(EMPTY);
  const [accessCode, setAccessCode] = useState("");
  const [history, setHistory] = useState([]); // follow-up turns: assistant, user, assistant, ...
  const [followUp, setFollowUp] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rm-draft");
      if (saved) setDetails({ ...EMPTY, ...JSON.parse(saved) });
      setAccessCode(localStorage.getItem("rm-code") || "");
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("rm-draft", JSON.stringify(details)); } catch {}
  }, [details]);

  const set = (key) => (e) => setDetails((d) => ({ ...d, [key]: e.target.value }));
  const started = history.length > 0;
  const currentMode = MODES.find((m) => m.id === mode);

  async function send(nextHistory) {
    setError("");
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const withReply = [...nextHistory, { role: "assistant", content: "" }];
    setHistory(withReply);
    try {
      try { localStorage.setItem("rm-code", accessCode); } catch {}
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, details, history: nextHistory.slice(1), accessCode }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setHistory([...nextHistory, { role: "assistant", content: text }]);
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message);
        setHistory(nextHistory.length > 1 ? nextHistory.slice(0, -1) : []);
        if (nextHistory.length > 1) setFollowUp(nextHistory[nextHistory.length - 1].content);
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  // history[0] is a placeholder for the form submission; the server rebuilds it from `details`.
  const submit = (e) => {
    e.preventDefault();
    send([{ role: "user", content: "__submission__" }]);
  };

  const ask = (e) => {
    e.preventDefault();
    const q = followUp.trim();
    if (!q || streaming) return;
    setFollowUp("");
    send([...history, { role: "user", content: q }]);
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [history.length]);

  const reset = () => {
    abortRef.current?.abort();
    setHistory([]);
    setError("");
  };

  const conversation = history.slice(1);

  return (
    <main className="wrap">
      <header className="hero">
        <div className="badge">🎓 Research Mentor</div>
        <h1>Feedback on your research — before your committee sees it.</h1>
        <p>
          Get mentor-style feedback on your topic, research questions, proposal and the alignment between your
          paradigm, methodology and methods. It guides — it won't write your proposal for you.
        </p>
      </header>

      {!started && (
        <form onSubmit={submit} className="card">
          <h2>1. What do you want feedback on?</h2>
          <div className="modes">
            {MODES.map((m) => (
              <button type="button" key={m.id} onClick={() => setMode(m.id)} className={`mode ${mode === m.id ? "active" : ""}`}>
                <span className="mode-icon">{m.icon}</span>
                <span className="mode-title">{m.title}</span>
                <span className="mode-blurb">{m.blurb}</span>
              </button>
            ))}
          </div>

          <h2>2. Tell the mentor about your study</h2>
          <div className="grid">
            <label>
              Level
              <select value={details.level} onChange={set("level")}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
            <label>
              Discipline / field
              <input value={details.discipline} onChange={set("discipline")} placeholder="e.g. Education, Public Health, Social Work" />
            </label>
          </div>
          <label>
            Working title or topic
            <input value={details.title} onChange={set("title")} placeholder="e.g. Help-seeking among Black male college students" />
          </label>
          {MODE_FIELDS[mode].includes("paradigm") && (
            <div className="grid">
              <label>
                Research paradigm
                <select value={details.paradigm} onChange={set("paradigm")}>
                  {PARADIGMS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
              {MODE_FIELDS[mode].includes("approach") && (
                <label>
                  Approach
                  <select value={details.approach} onChange={set("approach")}>
                    {APPROACHES.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </label>
              )}
            </div>
          )}
          {!MODE_FIELDS[mode].includes("paradigm") && MODE_FIELDS[mode].includes("approach") && (
            <label>
              Approach
              <select value={details.approach} onChange={set("approach")}>
                {APPROACHES.map((a) => <option key={a}>{a}</option>)}
              </select>
            </label>
          )}
          {MODE_FIELDS[mode].filter((f) => TEXT_FIELDS[f]).map((f) => (
            <label key={f}>
              {TEXT_FIELDS[f].label}
              <textarea rows={TEXT_FIELDS[f].rows} value={details[f]} onChange={set(f)} placeholder={TEXT_FIELDS[f].hint} />
            </label>
          ))}

          <div className="actions">
            <input
              className="code"
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Access code (if your instructor gave you one)"
            />
            <button className="primary" disabled={streaming}>
              Get {currentMode.title.toLowerCase()} feedback →
            </button>
          </div>
          {error && <p className="error">{error}</p>}
          <p className="note">Your draft is saved in this browser only. Don't paste confidential participant data.</p>
        </form>
      )}

      {started && (
        <section className="thread">
          <div className="thread-head">
            <span>{currentMode.icon} {currentMode.title} · {details.title || "Untitled study"}</span>
            <button className="ghost" onClick={reset}>← Edit & start over</button>
          </div>
          {conversation.map((turn, i) =>
            turn.role === "assistant" ? (
              <article key={i} className="card reply">
                {turn.content ? <Markdown text={turn.content} /> : <p className="thinking">The mentor is reading your work carefully…</p>}
              </article>
            ) : (
              <div key={i} className="question">{turn.content}</div>
            )
          )}
          {error && <p className="error">{error}</p>}
          <form onSubmit={ask} className="ask">
            <textarea
              rows={3}
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder="Ask a follow-up, e.g. “Is interpretive phenomenology a better fit than case study?” or paste a revised research question"
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask(e); }}
            />
            {streaming ? (
              <button type="button" className="ghost" onClick={() => abortRef.current?.abort()}>Stop</button>
            ) : (
              <button className="primary" disabled={!followUp.trim()}>Ask</button>
            )}
          </form>
          <div ref={endRef} />
        </section>
      )}

      <footer className="foot">
        AI feedback can be wrong. Treat it as a second opinion, check any sources it names, and follow your
        supervisor's and institution's guidance.
      </footer>
    </main>
  );
}
