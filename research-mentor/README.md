# 🎓 Research Mentor

An AI research mentor that gives students feedback on their **research topic, research questions, proposal, theoretical framework, methodology and paradigm alignment**, the way a supportive but rigorous supervisor would.

It is a **standalone app**, independent of any other project in this repository. It has its own `package.json` and no shared database, login or code.

Powered by Claude (`claude-opus-5`) through the Anthropic API.

---

## What students can get feedback on

| Mode | What the mentor checks |
|------|------------------------|
| 💡 Research Topic | Clarity, significance, gap, researchability, scope for the level, plus 2–3 sharpened reframings |
| ❓ Problem & Research Questions | Problem → purpose → questions logic, question wording vs approach, revised wording |
| 🧭 Paradigm Alignment | The full chain in a verdict table: problem → purpose → RQs → paradigm (ontology, epistemology, axiology) → framework → methodology → methods → quality criteria → claims |
| 🔬 Methodology & Design | Design-to-question fit, sampling, instruments, analysis, rigour, positionality, ethics, feasibility |
| 📄 Full Proposal Review | Committee-style review ending in a readiness verdict and a prioritised revision plan |
| 🏛️ Theory & Literature | Whether the framework is actually used, and whether the review synthesises and builds to a gap |

After the first review, students can ask follow-up questions, such as "would phenomenology fit better than case study?", or paste a revised research question.

### How the mentor behaves
- **It mentors rather than ghostwrites.** It explains issues and models an example, but it doesn't write whole sections for the student.
- **It prioritises.** Each concern is labelled Critical, Important or Minor.
- **It calibrates to the student's level**, from undergraduate to doctoral.
- **It respects every paradigm:** positivist, interpretivist, critical, pragmatist, critical realist, and Indigenous, decolonial or Afrocentric. It judges work by its own paradigm's standards and flags incoherence between the links in the chain.
- **It won't invent citations.** It names well-known methodologists only, and tells students to verify every source.

The full prompt is in [`lib/mentor.js`](lib/mentor.js). Edit it there to change the tone, the modes or the rubric.

---

## Setup

```bash
cd research-mentor
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY (and optionally ACCESS_CODE)
npm run dev                  # http://localhost:3000
```

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Required. Create one at [console.anthropic.com](https://console.anthropic.com) |
| `ACCESS_CODE` | Optional but recommended. Students must enter this code, so strangers can't use your API credit |

### Deploy to Vercel
1. Import the repository in Vercel and set **Root Directory** to `research-mentor`.
2. Add `ANTHROPIC_API_KEY` and `ACCESS_CODE` as environment variables.
3. Deploy. The feedback route streams its responses and allows up to 300 seconds (`maxDuration`), so long proposal reviews don't time out.

To move the app into its own repository, copy the `research-mentor/` folder. It has no dependencies outside itself.

---

## Structure

```
research-mentor/
├── app/
│   ├── api/feedback/route.js   # POST: validates input, streams Claude's feedback
│   ├── components/Markdown.js  # Safe Markdown renderer for responses
│   ├── page.js                 # Mode picker, study form, feedback thread
│   ├── layout.js
│   └── globals.css             # Light/dark theme
├── lib/mentor.js               # System prompt, modes, paradigms, prompt builder
├── .env.example
└── package.json
```

## Technical notes
- **Model:** `claude-opus-5` with adaptive thinking at `high` effort. The response is streamed to the browser as it is written.
- **Prompt caching:** the conversation prefix is cached, so follow-up questions don't pay again for the full proposal.
- **Refusal fallback:** `fallbacks: "default"` is set. If a safety classifier declines a request, for example a benign study on mental health or security, the API retries on Anthropic's recommended fallback model.
- **Limits:** 60k characters per field, 120k per submission, and 20 follow-ups per conversation.
- **Privacy:** drafts are saved only in the student's browser (`localStorage`). Nothing is stored on the server. Students should not paste identifiable participant data.
