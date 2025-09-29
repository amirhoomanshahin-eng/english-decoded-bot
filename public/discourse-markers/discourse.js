document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("userExample");
  const checkBtn = document.getElementById("checkBtn");
  const resetBtn = document.getElementById("resetBtn");
  const feedbackDiv = document.getElementById("feedback");

  // Load saved data
  const savedExample = localStorage.getItem("aboveAllExample");
  const savedFeedback = localStorage.getItem("aboveAllFeedback");

  if (savedExample) textarea.value = savedExample;
  if (savedFeedback) feedbackDiv.innerHTML = savedFeedback;

  // Handle AI check (sends example to backend)
  checkBtn.addEventListener("click", async () => {
    const example = textarea.value.trim();
    if (!example) {
      feedbackDiv.innerHTML = "<p style='color:red'>⚠ Please write a sentence first.</p>";
      return;
    }

    // Save example in localStorage
    localStorage.setItem("aboveAllExample", example);

    // Call backend AI check
    try {
      const res = await fetch("/api/check-example", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ example })
      });
      const data = await res.json();

      const feedback = `<p><b>Result:</b> ${data.correct ? "✅ Correct!" : "❌ Incorrect"}<br>${data.explanation}</p>`;
      feedbackDiv.innerHTML = feedback;

      // Save feedback
      localStorage.setItem("aboveAllFeedback", feedback);

    } catch (err) {
      console.error(err);
      feedbackDiv.innerHTML = "<p style='color:red'>⚠ Error checking example. Try again later.</p>";
    }
  });

  // Reset example
  resetBtn.addEventListener("click", () => {
    textarea.value = "";
    feedbackDiv.innerHTML = "";
    localStorage.removeItem("aboveAllExample");
    localStorage.removeItem("aboveAllFeedback");
  });
});