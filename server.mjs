import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { exec } from 'child_process';

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// 🔥 GITHUB AUTO-DEPLOY WEBHOOK
app.post('/deploy', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const secret = 'MY_SECRET_123'; // <--- CHANGE TO YOUR SECRET

  const body = JSON.stringify(req.body);
  const hash = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')}`;

  if (signature !== hash) {
    console.log('❌ Invalid GitHub signature - Unauthorized deploy attempt');
    return res.status(401).send('Unauthorized');
  }

  console.log('🚀 Valid GitHub webhook - starting deployment...');

  exec('bash /srv/mybot/deploy.sh', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Deploy script error:', error);
      return;
    }
    console.log('📦 Deploy output:', stdout);
    console.log('⚠ Deploy errors:', stderr);
  });

  res.send('Deployment started!');
});

// TELEGRAM WEBHOOK
app.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log('📩 Telegram update:', update);

    if (update.message) {
      const chatId = update.message.chat.id;

      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: 'Your bot is now connected on port 3001!',
        }),
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Webhook error:', err);
    res.sendStatus(500);
  }
});

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ BOT running on port ${PORT}`);
});