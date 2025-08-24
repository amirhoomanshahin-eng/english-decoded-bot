import os
import sqlite3
import datetime
import pytz
from flask import Flask, render_template, request, jsonify
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, ContextTypes
from threading import Thread

TOKEN = os.getenv("BOT_TOKEN")
TEHRAN_TZ = pytz.timezone("Asia/Tehran")

# ---------------- DATABASE ---------------- #
def init_db():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS progress (
            user_id INTEGER PRIMARY KEY,
            lesson TEXT
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS time_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            start_time TEXT,
            end_time TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_progress(user_id, lesson):
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO progress (user_id, lesson) VALUES (?, ?)", (user_id, lesson))
    conn.commit()
    conn.close()

def get_progress(user_id):
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("SELECT lesson FROM progress WHERE user_id=?", (user_id,))
    row = c.fetchone()
    conn.close()
    return row[0] if row else None

def log_time(user_id, start_time, end_time):
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("INSERT INTO time_logs (user_id, start_time, end_time) VALUES (?, ?, ?)",
              (user_id, start_time.isoformat(), end_time.isoformat()))
    conn.commit()
    conn.close()

def get_weekly_time(user_id):
    now = datetime.datetime.now(TEHRAN_TZ)
    days_since_saturday = (now.weekday() + 2) % 7
    week_start = now - datetime.timedelta(days=days_since_saturday)
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)

    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("SELECT start_time, end_time FROM time_logs WHERE user_id=?", (user_id,))
    rows = c.fetchall()
    conn.close()

    total_seconds = 0
    for start, end in rows:
        start_dt = datetime.datetime.fromisoformat(start).astimezone(TEHRAN_TZ)
        end_dt = datetime.datetime.fromisoformat(end).astimezone(TEHRAN_TZ)
        if start_dt >= week_start:
            total_seconds += (end_dt - start_dt).total_seconds()

    minutes = int(total_seconds // 60)
    return minutes

# Initialize DB
init_db()

# ---------------- FLASK ---------------- #
app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/lesson/<lesson_name>/<int:user_id>")
def lesson(lesson_name, user_id):
    save_progress(user_id, lesson_name)
    return render_template(f"{lesson_name}.html", user_id=user_id)

@app.route("/log_time", methods=["POST"])
def log_time_endpoint():
    data = request.json
    user_id = data.get("user_id")
    duration = data.get("duration")  # seconds
    start_time = datetime.datetime.now(TEHRAN_TZ) - datetime.timedelta(seconds=duration)
    end_time = datetime.datetime.now(TEHRAN_TZ)
    log_time(user_id, start_time, end_time)
    return jsonify({"status": "success"})

# ---------------- TELEGRAM BOT ---------------- #
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.message.from_user.id
    last = get_progress(user_id)

    if last:
        welcome_text = f"Welcome back! 📚 You last studied *{last}*.\n\nTap below to continue:"
    else:
        welcome_text = "Welcome to *English Decoded*! 📚\n\nTap below to start your first lesson:"

    keyboard = [
        [InlineKeyboardButton(
            "📖 Discourse Markers",
            web_app=WebAppInfo(url=f"https://english-decoded-bot.onrender.com/lesson/discourse_markers/{user_id}")
        )],
        [InlineKeyboardButton("📊 My Progress", callback_data="my_progress")]
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        welcome_text,
        parse_mode="Markdown",
        reply_markup=reply_markup