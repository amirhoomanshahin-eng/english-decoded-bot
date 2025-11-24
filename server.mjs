// server.mjs
import 'dotenv/config'; // automatically loads .env into process.env
import express from 'express'; // if you are using Express
import fetch from 'node-fetch'; // ES Module fetch
import path from 'path';
import { fileURLToPath } from 'url';

// ---- Utilities for __dirname in ESM ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- App Setup ----
const app = express();
const PORT = process.env.PORT || 3001;

// ---- Middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Example route
app.get('/', (req, res) => {
  res.send('Hello! Bot is running.');
});

// Example fetch usage
app.get('/data', async (req, res) => {
  try {
    const response = await fetch('https://api.github.com');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`BOT running on port ${PORT}`);
});