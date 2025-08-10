import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;

/* ✅ Your Render env var name */
const API_KEY = process.env.ledger1;               // <-- must exist in Render
const MODEL   = process.env.LEDGER_MODEL || "gpt-5"; // set to a valid model

if (!API_KEY) {
  console.error("❌ Missing env var: ledger1");
}

const openai = new OpenAI({ apiKey: API_KEY });

app.use(express.json());

/* Serve the UI (index.html is in the SAME folder as server.js per your screenshot) */
app.use(express.static(__dirname));
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "index.html")));

/* Chat endpoint */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ ok: false, error: "message required" });

    const completion = await openai.chat.completions.create({
      model: MODEL,                       // e.g., "gpt-5" / "gpt-5-mini"
      temperature: 0.2,
      max_tokens: 500,
      messages: [
        { role: "system", content: "You are a concise supply-chain copilot. Start with a one-sentence recommendation, then a brief rationale." },
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "";
    if (!reply) return res.status(502).json({ ok: false, error: "No content from OpenAI" });

    res.json({ ok: true, reply });
  } catch (err) {
    console.error("OpenAI error:", err?.response?.data || err.message || err);
    // Bubble a readable error to the UI so you’re not stuck with "..."
    res.status(502).json({ ok: false, error: err?.response?.data || err.message || "Upstream error" });
  }
});

/* SPA fallback so you never see "Cannot GET /" */
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.listen(PORT, () => {
  console.log(`✅ Ledger listening on :${PORT}`);
});

