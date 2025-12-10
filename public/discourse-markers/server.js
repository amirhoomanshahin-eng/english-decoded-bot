// server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();

// Allow your frontend domain
app.use(
  cors({
    origin: "https://guage-academy.ir", // change if needed
  })
);

app.use(express.json());
app.post("/api/check-above-all", async (req, res) => {
  console.log("▶ Received POST /api/check-above-all");

  const { sentence } = req.body;

  if (!sentence || typeof sentence !== "string") {
    return res.status(400).send("Missing 'sentence' in request body.");
  }

  const prompt = `
You are an English teacher. Analyse the following sentence.

Tasks:
1. Correct any grammar, punctuation, or word choice mistakes.
2. Evaluate the use of the discourse marker "above all":
   - Is it used in the right place?
   - Does it correctly emphasise the most important idea?
3. If "above all" is missing but would be useful, suggest where to place it.
4. Give short, friendly feedback for a learner of English.
5. Provide a final improved version of the sentence.

Return your answer in simple HTML with these sections:

<strong>Correction:</strong> ...
<br>
<strong>Discourse marker feedback:</strong> ...
<br>
<strong>Improved sentence:</strong> ...

User sentence:
"${sentence}"
  `;

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  // Simple retry loop for 503 "model overloaded"
  const maxRetries = 3;

  try {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        const parts = data?.candidates?.[0]?.content?.parts;

        if (!parts || !parts.length) {
          console.error("No candidates returned from Gemini:", data);
          return res.status(500).send("No candidates returned from Gemini.");
        }

        const html = parts.map((p) => p.text || "").join("");
        return res.send(html);
      }

      // Not OK: read error text
      const errorText = await response.text();
      console.error(
        `Gemini API error (attempt ${attempt}):`,
        response.status,
        errorText
      );

      // If it's NOT 503, don't retry further
      if (response.status !== 503) {
        return res
          .status(500)
          .send(`Gemini API error ${response.status}: ${errorText}`);
      }

      // If it *is* 503 ("model overloaded") and we still have retries left, wait then retry
      if (attempt < maxRetries) {
        const delayMs = attempt * 1000; // 1s, 2s, 3s
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      // If we exhausted retries, send a nicer message
      return res
        .status(503)
        .send(
          "The AI model is temporarily overloaded. Please try again in a moment."
        );
    }
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).send("Internal server error.");
  }
});

