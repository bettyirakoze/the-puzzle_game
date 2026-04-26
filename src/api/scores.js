const API = "https://the-puzzle-backend.onrender.com/api/scores";

/* ================= GET SCORES ================= */
export async function getScores() {
  try {
    const res = await fetch(API);
    return await res.json();
  } catch (err) {
    console.error("Error loading scores:", err);
    return [];
  }
}

/* ================= SAVE SCORE ================= */
export async function saveScore(score) {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(score)
    });

    return await res.json();
  } catch (err) {
    console.error("Error saving score:", err);
    return { success: false };
  }
}