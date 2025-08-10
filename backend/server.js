// /backend/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;

/* ✅ Your Render env var is named exactly 'ledger1' */
const API_KEY      = process.env.ledger1;
const MODEL        = process.env.LEDGER_MODEL   || "gpt-5";
const PROVIDER_URL = process.env.LEDGER_API_URL || "https://api.openai.com/v1/chat/completions";

if (!API_KEY) {
  console.warn("⚠️  Env var 'ledger1' is missing. Set it in Render → Environment.");
}

app.use(express.json());

/* ---- Serve UI from the repo root (index.html is NOT inside /backend) ---- */
const UI_DIR = path.join(__dirname, "..");  // go up one level to the repo root
app.use(express.static(UI_DIR));            // serve static assets from root
app.get("/", (_req, res) => {
  res.sendFile(path.join(UI_DIR, "index.html"));
});

/* ---- Chat API ---- */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ ok:false, error:"message required" });

    const r = await fetch(PROVIDER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`, // uses ledger1
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: message }],
        temperature: 0.2,
        max_tokens: 500
      })
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      return res.status(502).json({ ok:false, error:`upstream ${r.status} ${txt}` });
    }

    const data  = await r.json();
    const reply = data?.choices?.[0]?.message?.content?.trim?.() || "…";
    res.json({ ok:true, reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error:e.message });
  }
});

/* Fallback so routes like /anything still load the app (prevents "Cannot GET /") */
app.get("*", (_req, res) => {
  res.sendFile(path.join(UI_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Ledger listening on :${PORT}`);
  console.log(`✅ Serving UI from: ${UI_DIR}`);
});

