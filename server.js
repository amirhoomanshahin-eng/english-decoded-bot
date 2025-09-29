import express from "express";
import path from "path";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(process.cwd(), "public")));

// 🔑 Setup OpenAI client (make sure OPENAI_API_KEY is set in Render/Telegram env vars)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Example test API
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// ✅ AI check endpoint
app.post("/api/check-example", async (req, res) => {
  const { example } = req.body;

  if (!example) {
    return res.status(400).json({ error: "No example provided" });
  }

  try {
    // Ask OpenAI if the sentence correctly uses "above all"
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful English teacher. Check if a student's sentence uses 'above all' correctly. Be strict but encouraging. Return JSON with fields: correct (true/false) and explanation."
        },
        {
          role: "user",
          content: `Here is the student's sentence: "${example}"`
        }
      ],
      temperature: 0.3,
    });

    // Parse AI response
    let result;
    try {
      result = JSON.parse(response.choices[0].message.content);
    } catch {
      // fallback: return as plain explanation
      result = {
        correct: false,
        explanation: response.choices[0].message.content,
      };
    }

    res.json(result);

  } catch (err) {
    console.error("Error checking example:", err);
    res.status(500).json({ error: "AI check failed" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});