from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, ContextTypes

# Replace this with your real token from BotFather
TOKEN = "YOUR_BOT_TOKEN_HERE"

# Lessons stored in a dictionary
lessons = {
    "discourse_markers": [
        "Lesson 1: Using 'however' — Example: I wanted to go; however, it rained.",
        "Lesson 2: Using 'therefore' — Example: It was raining; therefore, we stayed in.",
        "Lesson 3: Using 'meanwhile' — Example: She cooked dinner; meanwhile, he set the table."
    ]
}

# Start command with main menu
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("📌 Discourse Markers", callback_data="discourse_markers")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "📚 Welcome to English Decoded!\n\nSelect a topic to start learning:",
        reply_markup=reply_markup
    )

# Handle button presses
async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if query.data == "discourse_markers":
        # Show lessons for discourse markers
        text = "📌 **Discourse Markers Lessons** 📌\n\n"
        for i, lesson in enumerate(lessons["discourse_markers"], start=1):
            text += f"{i}. {lesson}\n\n"
        await query.edit_message_text(text=text, parse_mode="Markdown")

# Main bot setup
app = ApplicationBuilder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(CallbackQueryHandler(button_handler))

print("✅ Bot is running with buttons...")
app.run_polling()