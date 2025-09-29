import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to handle JSON requests
app.use(express.json());

// Serve static frontend (everything in /public)
app.use(express.static(path.join(process.cwd(), "public")));

// Example backend API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// === NEW ROUTE for "Above All" checking ===
app.post("/check-above-all", (req, res) => {
  const { sentence } = req.body;

  if (!sentence) {
    return res.status(400).json({ error: "No sentence provided" });
  }

  // Simple validation: check if "above all" is included
  const lower = sentence.toLowerCase();
  if (lower.includes("above all")) {
    return res.json({
      correct: true,
      explanation: "✅ Good! You used 'above all' correctly in context.",
    });
  } else {
    return res.json({
      correct: false,
      explanation:
        "❌ It looks like you didn’t use 'above all'. Try making a sentence with it.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});