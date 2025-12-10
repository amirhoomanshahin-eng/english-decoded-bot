// server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();

// Allow your frontend domain
app.use(
  cors({
    origin: "https://guage-academy.ir", // change if needed
  })
);

app.use(express.json());

