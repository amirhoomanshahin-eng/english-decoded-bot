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

// Button event - fetch backend API
document.getElementById("fetchBtn").addEventListener("click", async () => {
  try {
    const res = await fetch("/api/hello");
    const data = await res.json();
    document.getElementById("response").innerText = data.message;
  } catch (err) {
    document.getElementById("response").innerText = "Error: " + err.message;
  }
});