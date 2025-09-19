// Access Telegram WebApp API
const tg = window.Telegram.WebApp;

// Expand to full screen
tg.expand();

// Show user info
const user = tg.initDataUnsafe?.user;
const welcomeEl = document.getElementById("welcome");

if (user) {
  welcomeEl.innerText = `Hello, ${user.first_name}! 👋`;
} else {
  welcomeEl.innerText = "Hello, guest!";
}