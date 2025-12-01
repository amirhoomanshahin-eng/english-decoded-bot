// discourse.js
const GEMINI_API_KEY = AIzaSyAPxBhxb4itgNsjCQCIiL9MeNcPtT8IdOQ;

async function checkSentence(sentence) {
  const prompt = `
Your job is to evaluate the user's sentence for:
1. Correct grammar and fluency.
2. Proper use of the discourse marker "above all".
3. Give friendly feedback.
4. Provide a corrected and improved version.

Return the answer in clean HTML.

User sentence: "${sentence}"
  `;

  const body = {
    contents: [{
      parts: [{ text: prompt }]
    }]
  };

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  const checkBtn = document.getElementById("checkBtn");
  const resetBtn = document.getElementById("resetBtn");
  const feedbackDiv = document.getElementById("feedback");
  const userExample = document.getElementById("userExample");

  checkBtn.addEventListener("click", async () => {
    const sentence = userExample.value.trim();

    if (!sentence) {
      feedbackDiv.innerHTML = "⚠️ Please write a sentence first.";
      return;
    }

    feedbackDiv.innerHTML = "⏳ Checking your sentence...";

    const result = await checkSentence(sentence);

    feedbackDiv.innerHTML = `
      <h3>AI Feedback</h3>
      <p>${result}</p>
    `;
  });

  resetBtn.addEventListener("click", () => {
    userExample.value = "";
    feedbackDiv.innerHTML = "";
  });
});