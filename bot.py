import os
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from flask import Flask, render_template
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, MessageHandler, filters
from threading import Thread

# Telegram bot token
TOKEN = os.getenv("BOT_TOKEN")

# Store user activity times (in seconds)
user_progress = {}

# Flask app to serve the mini app
app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

# /start command for Telegram bot
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [KeyboardButton("📖 Discourse Markers", web_app=WebAppInfo(url="https://english-decoded-bot.onrender.com"))],
        [KeyboardButton("📊 My Progress")]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    await update.message.reply_text(
        "Welcome to *English Decoded*! 📚\n\nChoose an option:",
        parse_mode="Markdown",
        reply_markup=reply_markup
    )

# Handle "My Progress" button
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.message.from_user.id
    text = update.message.text

    if text == "📊 My Progress":
        tz = ZoneInfo("Asia/Tehran")
        now = datetime.now(tz)

        # Week starts Saturday
        weekday = now.weekday()  # Monday=0 ... Sunday=6
        days_since_saturday = (weekday - 5) % 7
        start_of_week = (now - timedelta(days=days_since_saturday)).replace(hour=0, minute=0, second=0, microsecond=0)

        # Get total time spent this week
        total_seconds = user_progress.get(user_id, 0)
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        await update.message.reply_text(
            f"📊 *Your Progress (Sat–Fri, Tehran time)*\n\n"
            f"Time spent this week: {hours}h {minutes}m {seconds}s",
            parse_mode="Markdown"
        )
    else:
        # For testing: simulate +5 minutes every time user sends any text
        user_progress[user_id] = user_progress.get(user_id, 0) + 5 * 60


def run_flask():
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)


if __name__ == "__main__":
    # Start Flask in background
    Thread(target=run_flask).start()

    # Start Telegram bot
    application = ApplicationBuilder().token(TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    application.run_polling()