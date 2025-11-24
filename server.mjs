// server.mjs
import TelegramBot from 'node-telegram-bot-api';
import express from 'express';

// --- Telegram Bot ---
const TOKEN = '8093299819:AAFnsBL1N4pAjkyiA9t9Mn7FU3ICeG_zF7c';
const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  console.log(`Message from ${chatId}: ${text}`);

  if (text.toLowerCase() === '/start') {
    bot.sendMessage(chatId, '👋 Hello! Bot is running.');
  } else {
    bot.sendMessage(chatId, `You said: ${text}`);
  }
});

// --- Express Server (optional) ---
const app = express();
const PORT = 3001;

app.get('/', (req, res) => res.send('Bot is running!'));

app.listen(PORT, () => console.log(`Express server listening on port ${PORT}`));