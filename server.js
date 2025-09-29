import express from "express";
import path from "path";
import fetch from "node-fetch"; // for API calls

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.json());

// Hugging Face API setup
const HF_API_KEY = process.env.HF_API_KEY; // save your token in env variable
const MODEL = "google/flan-t5-large";

// Example backend API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Sentence checking route
app.post("/api/check-sentence", async (req, res) => {
  const { sentence } = req.body;

  if (!sentence) {
    return res.status(400).json({ error: "No sentence provided" });
  }

  // Prepare prompt for the model
  const prompt = `Check if the following sentence uses the discourse marker "above all" correctly. 
Explain if it is correct or not, and why. Give a short explanation:\n\n"${sentence}"`;

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } }),
    });

    const data = await response.json();

    // Hugging Face returns an array of generated texts
    const result = Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : "No response from model";

    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI request failed" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});