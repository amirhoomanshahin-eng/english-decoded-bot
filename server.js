import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;

// ====== STATIC FRONTEND (Mini App) ======
app.use(express.static(path.join(process.cwd(), "public")));

// ====== Example backend API ======
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// ====== TEST route ======
app.get("/api/test-fetch", async (req, res) => {
  try {
    const response = await fetch("https://api.github.com");
    const data = await response.json();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ====== TELEGRAM WEBHOOK ======
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const update = req.body;
  console.log("📩 Telegram update:", update);

  try {
    // Handle /start command — send Mini App button
    if (update.message && update.message.text === "/start") {
      const chatId = update.message.chat.id;

      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "Welcome! Tap the button below to open the Mini App 👇",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Open Mini App",
                    web_app: {
                      url: "https://shahin-language-academy.ir"
                    }
                  }
                ]
              ]
            }
          })
        }
      );
    }

    // Handle /test command
    if (update.message && update.message.text === "/test") {
      const chatId = update.message.chat.id;
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "Webhook is working!"
          })
        }
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.sendStatus(500);
  }
});

// ====== START SERVER ======
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on port ${PORT}`)
);