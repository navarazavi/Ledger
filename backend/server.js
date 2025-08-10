import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const LEDGER_API_KEY = process.env.ledger; // matches your Render variable name
const LEDGER_API_URL = "https://api.openai.com/v1/chat/completions";
const LEDGER_MODEL = "gpt-5"; // your GPT-5 model

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch(LEDGER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LEDGER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: LEDGER_MODEL,
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
