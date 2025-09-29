import express from "express";
import path from "path";
import fetch from "node-fetch";  // or use built-in fetch in newer Node versions

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

// Example route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend with DeepSeek integration!" });
});

// DeepSeek check endpoint
app.post("/api/check-example", async (req, res) => {
  const { example } = req.body;
  if (!example) {
    return res.status(400).json({ error: "No example provided" });
  }

  try {
    // Use your DeepSeek API key
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekKey) {
      return res.status(500).json({ error: "DeepSeek API key not configured" });
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${deepseekKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", 
        messages: [
          {
            role: "system",
            content: "You are an English teacher. Check whether the student’s sentence uses ‘above all’ correctly, and explain if it's right or wrong."
          },
          {
            role: "user",
            content: example
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek error: ${errText}`);
    }

    const data = await response.json();

    // Depending on how DeepSeek returns, extract correct/explanation
    // For example, assuming it returns something like:
    // { choices: [ { message: { content: "..." } } ], ... }
    const content = data.choices[0].message.content;
    // You may format or parse content if the model returns JSON
    // For simplicity, we can just send that content string
    return res.json({ explanation: content });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DeepSeek API request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});