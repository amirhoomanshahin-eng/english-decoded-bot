require("dotenv").config();
const express = require("express");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

app.post("/webhook", async (req, res) => {
  try {
    const update = req.body;
    console.log("📩 Telegram update:", update);

    if (update.message) {
      const chatId = update.message.chat.id;

      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "Your bot is now connected on port 3001!"
        })
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.sendStatus(500);
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ BOT running on port ${PORT}`);
});