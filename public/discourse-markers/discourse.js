// discourse.js

// No API key here anymore!

async function checkSentenceWithGemini(sentence) {
  let response;

  try {
    response = await fetch("/api/check-above-all", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sentence }),
    });
  } catch (networkErr) {
    console.error("Network error calling backend:", networkErr);
    throw new Error(
      "Network error when calling the server. Check your connection or server."
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Backend error:", response.status, errorText);
    throw new Error(`Server error ${response.status}: ${errorText}`);
  }

  // Backend returns the HTML string directly
  const resultHtml = await response.text();
  return resultHtml;
}

// 2️⃣ Wire up the buttons once the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const checkBtn = document.getElementById("checkBtn");
  const resetBtn = document.getElementById("resetBtn");
  const feedbackDiv = document.getElementById("feedback");
  const userExample = document.getElementById("userExample");

  if (!checkBtn || !resetBtn || !feedbackDiv || !userExample) {
    console.error("One or more elements not found. Check your HTML IDs.");
    return;
  }

  checkBtn.addEventListener("click", async () => {
    const sentence = userExample.value.trim();

    if (!sentence) {
      feedbackDiv.innerHTML =
        "⚠️ Please write a sentence using <b>'above all'</b>.";
      return;
    }

    feedbackDiv.innerHTML = "⏳ Checking your sentence with AI...";

    try {
      const resultHtml = await checkSentenceWithGemini(sentence);
      feedbackDiv.innerHTML = `
        <h3>AI Feedback</h3>
        <div>${resultHtml}</div>
      `;
    } catch (err) {
      console.error(err);
      feedbackDiv.innerHTML = `
        ❌ <b>Something went wrong.</b><br>
        <small>${err.message}</small>
      `;
    }
  });

  resetBtn.addEventListener("click", () => {
    userExample.value = "";
    feedbackDiv.innerHTML = "";
  });
});