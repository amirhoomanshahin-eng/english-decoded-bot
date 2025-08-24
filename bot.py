import os
from flask import Flask, render_template, request, jsonify
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from threading import Thread
import pytz
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler

# ----------------------------
# Global settings
# ----------------------------
TOKEN = os.getenv("BOT_TOKEN")
TEHRAN_TZ = pytz.timezone("Asia/Tehran")
user_progress = {}  # {user_id: seconds}

# ----------------------------
# Flask app (mini app + tracking)
# ----------------------------
app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/track", methods=["POST"])
def track():
    data = request.get_json()
    user_id = data.get("user_id")
    action = data.get("action")

    if not user_id:
        return jsonify({"status": "error", "message": "Missing user_id"}), 400

    if action == "open":
        # Just ensure user exists in dict
        user_progress[user_id] = user_progress.get(user_id, 0)
    elif action == "heartbeat":
        # Add 30 seconds per ping
        user_progress[user_id] = user_progress.get(user_id, 0) + 30
    elif action == "close":
        # Add a little buffer when user closes
        user_progress[user_id] = user_progress.get(user_id, 0) + 5

    return jsonify({"status": "ok"})

# ----------------------------
# Telegram bot
# ----------------------------
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [KeyboardButton("📖 Discourse Markers", web_app=WebAppInfo(url="https://english-decoded-bot.onrender.com"))],
        [KeyboardButton("📊 My Progress")]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    await update.message.reply_text(
        "Welcome to *English Decoded*! 📚\n\nChoose an option below:",
        parse_mode="Markdown",
        reply_markup=reply_markup
    )

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    user_id = str(update.message.from_user.id)

    if text == "📊 My Progress":
        seconds = user_progress.get(user_id, 0)
        minutes = seconds // 60
        hours = minutes // 60
        minutes = minutes % 60

        await update.message.reply_text(
            f"⏳ Your study time this week:\n\n"
            f"{hours} hours {minutes} minutes"
        )

# ----------------------------
# Weekly reset function
# ----------------------------
def reset_progress():
    global user_progress
    user_progress = {}
    print("✅ Weekly progress reset at", datetime.now(TEHRAN_TZ))

# ----------------------------
# Run Flask + Telegram bot
# ----------------------------
def run_flask():
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

if __name__ == "__main__":
    # Start Flask in background
    Thread(target=run_flask).start()

    # Setup weekly reset scheduler
    scheduler = BackgroundScheduler(timezone=TEHRAN_TZ)
    scheduler.add_job(reset_progress, "cron", day_of_week="sat", hour=0, minute=0)
    scheduler.start()

    # Start Telegram bot
    application = ApplicationBuilder().token(TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("progress", button_handler))  # fallback command
    application.add_handler(CommandHandler("reset", lambda u, c: reset_progress()))  # manual reset
    application.add_handler(
        telegram.ext.MessageHandler(telegram.ext.filters.TEXT, button_handler)
    )
    application.run_polling()