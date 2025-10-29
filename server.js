import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend
app.use(express.static(path.join(process.cwd(), "public")));

// Example backend API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Example route showing how to use built-in fetch
app.get("/api/test-fetch", async (req, res) => {
  try {
    const response = await fetch("https://api.github.com");
    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on port ${PORT}`)
);