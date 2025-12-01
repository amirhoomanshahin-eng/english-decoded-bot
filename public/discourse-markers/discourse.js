// discourse.js

// 🔑 1. Your Gemini API key (TEMP for client-side testing)
// In production, never expose this in frontend code — use a backend proxy.
const GEMINI_API_KEY = "AIzaSyAPxBhxb4itgNsjCQCIiL9MeNcPtT8IdOQ";

async function checkSentenceWithGemini(sentence) {
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  // 🧠 Prompt focuses on grammar + "above all"
  const prompt = `
You are an English teacher. Analyse the following sentence.

Tasks:
1. Correct any grammar, punctuation, or word choice mistakes.
2. Evaluate the use of the discourse marker **"above all"**:
   - Is it used in the right place?
   - Does it correctly emphasise the most important idea?
3. If "above all" is missing but would be useful, suggest where to place it.
4. Give short, friendly feedback for a learner of English.
5. Provide a final improved version of the sentence.

Return your answer in simple HTML with these sections:

<strong>Correction:</strong> ...
<br>
<strong>Discourse marker feedback:</strong> ...
<br>
<strong>Improved sentence:</strong> ...

User sentence:
"${sentence}"
  `;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY, // ✅ recommended way
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", response.status, errorText);
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log("Gemini raw response:", data);

  const parts = data?.candidates?.[0]?.content?.parts;
  if (!parts || !parts.length) {
    throw new Error("No candidates returned from Gemini.");
  }

  // Join all text parts into one string
  return parts.map((p) => p.text || "").join("");
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
      feedbackDiv.innerHTML = "⚠️ Please write a sentence using <b>'above all'</b>.";
      return;
    }

    feedbackDiv.innerHTML = "⏳ Checking your sentence with Gemini...";

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