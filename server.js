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

// TELEGRAM BOT WEBHOOK
app.use(express.json());

app.post(`/webhook/${process.env.BOT_TOKEN}`, async (req, res) => {
  try {
    const update = req.body;

    console.log("📩 Telegram update:", update);

    // basic test reply for now
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = "Your bot is connected to ArvanCloud!";
      
      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
        }),
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});


app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on port ${PORT}`)
);