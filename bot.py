# bot.py - sends a WebApp button that opens your hosted learning page
import os
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo, Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# safer: put your token in Render/GitHub secrets, or keep here for testing
TOKEN = os.getenv("BOT_TOKEN")

# the URL of your hosted web page (replace after you deploy the web app)
WEBAPP_URL = os.getenv("WEBAPP_URL") or "https://your-webapp-url.example"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    kb = [
        [InlineKeyboardButton("📚 Open Learning Page", web_app=WebAppInfo(url=WEBAPP_URL))],
    ]
    reply = InlineKeyboardMarkup(kb)
    await update.message.reply_text(
        "Welcome to English Decoded! Tap the button below to open the learning page.",
        reply_markup=reply
    )

if __name__ == "__main__":
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    print("✅ Bot is running (webapp button)...")
    app.run_polling()