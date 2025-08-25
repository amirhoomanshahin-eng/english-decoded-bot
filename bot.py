import os
import pytz
import atexit
from datetime import datetime, timedelta
from threading import Thread

from flask import Flask, render_template, request, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
from telegram import Update, KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# === Global Vars ===
TOKEN = os.getenv("BOT_TOKEN")
app = Flask(__name__)

# Track user study times {user_id: seconds_this_week}
user_times = {}

# Tehran timezone
tehran = pytz.timezone("Asia/Tehran")


# ================== Flask Mini App ==================
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/track_time", methods=["POST"])
def track_time():
    data = request.json
    user_id = int(data.get("user_id"))
    duration = int(data.get("duration", 0))
    user_times[user_id] = user_times.get(user_id, 0) + duration
    return jsonify({"status": "ok"})


# ================== Telegram Bot ==================
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [KeyboardButton("📖 Open Lesson", web_app=WebAppInfo(url="https://english-decoded-bot.onrender.com"))],
        [KeyboardButton("📊 My Progress")]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    await update.message.reply_text(
        "Welcome to *English Decoded*! 📚\n\nChoose an option:",
        parse_mode="Markdown",
        reply_markup=reply_markup
    )

async def handle_buttons(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.message.from_user.id
    text = update.message.text

    if text == "📊 My Progress":
        seconds = user_times.get(user_id, 0)
        minutes = seconds // 60
        await update.message.reply_text(
            f"⏱ This week (Sat–Fri, Tehran time), you studied for *{minutes} minutes*.",
            parse_mode="Markdown"
        )


# ================== Weekly Reset ==================
def reset_weekly_times():
    global user_times
    user_times = {}
    print("✅ Weekly reset done (Saturday Tehran midnight).")

def schedule_reset():
    scheduler = BackgroundScheduler(timezone=tehran)
    # Every Saturday at 00:00 Tehran time
    scheduler.add_job(reset_weekly_times, "cron", day_of_week="sat", hour=0, minute=0)
    scheduler.start()
    atexit.register(lambda: scheduler.shutdown())


# ================== Run Flask + Bot ==================
def run_flask():
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

if __name__ == "__main__":
    # Start weekly reset
    schedule_reset()

    # Start Flask in background
    Thread(target=run_flask).start()

    # Start Telegram bot
    application = ApplicationBuilder().token(TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("progress", handle_buttons))
    application.add_handler(
        # also handle keyboard buttons
        telegram.ext.MessageHandler(telegram.ext.filters.TEXT, handle_buttons)
    )
    application.run_polling()