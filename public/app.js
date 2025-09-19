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

// Simple client-side navigation
function goToPage(page) {
  const content = document.getElementById("page-content");

  if (page === "discourse") {
    content.innerHTML = `
      <h2>📖 Discourse Markers</h2>
      <p>Here you will find examples and explanations of discourse markers.</p>
      <button onclick="goToPage('home')">⬅ Back</button>
    `;
  } else if (page === "resources") {
    content.innerHTML = `
      <h2>📚 Resources</h2>
      <p>Here are some useful links and resources for learning.</p>
      <button onclick="goToPage('home')">⬅ Back</button>
    `;
  } else {
    content.innerHTML = "";
  }
}