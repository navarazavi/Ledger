import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const LEDGER_API_KEY = process.env.ledger1; // Updated to ledger1
const PORT = process.env.PORT || 3000;

if (!LEDGER_API_KEY) {
  console.error("❌ Missing ledger1 environment variable!");
  process.exit(1);
}

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch("https://api.ledger.ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LEDGER_API_KEY}`
      },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();
    res.json({ reply: data.reply || "No response from API" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
