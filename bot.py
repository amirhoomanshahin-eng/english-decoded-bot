import os
import sqlite3
from flask import Flask, render_template, request
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from threading import Thread

TOKEN = os.getenv("BOT_TOKEN")

# ---------------- DATABASE FUNCTIONS ---------------- #
def init_db():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS progress (
            user_id INTEGER PRIMARY KEY,
            lesson TEXT
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

# Initialize DB on startup
init_db()

# ---------------- FLASK APP ---------------- #
app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/lesson/<lesson_name>/<int:user_id>")
def lesson(lesson_name, user_id):
    # save user progress whenever they visit a lesson
    save_progress(user_id, lesson_name)
    return render_template(f"{lesson_name}.html")

@app.route("/progress/<int:user_id>")
def progress(user_id):
    last = get_progress(user_id)
    if last:
        return f"Your last lesson was: {last}"
    else:
        return "No progress yet!"

# ---------------- TELEGRAM BOT ---------------- #
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.message.from_user.id
    last = get_progress(user_id)

    if last:
        welcome_text = f"Welcome back! 📚 You last studied *{last}*.\n\nTap below to continue:"
    else:
        welcome_text = "Welcome to *English Decoded*! 📚\n\nTap below to start your first lesson:"

    keyboard = [
        [KeyboardButton(
            "📖 Discourse Markers",
            web_app=WebAppInfo(url=f"https://english-decoded-bot.onrender.com/lesson/discourse_markers/{user_id}")
        )]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

    await update.message.reply_text(
        welcome_text,
        parse_mode="Markdown",
        reply_markup=reply_markup
    )

# ---------------- RUN BOTH ---------------- #
def run_flask():
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

if __name__ == "__main__":
    # Start Flask in background
    Thread(target=run_flask).start()

    # Start Telegram bot
    application = ApplicationBuilder().token(TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.run_polling()