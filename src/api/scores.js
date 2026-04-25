const API_URL = "http://localhost:3000/api/scores";

// SAVE SCORE TO BACKEND
export async function saveScore(score) {
  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(score)
  });
}

// GET LEADERBOARD FROM BACKEND
export async function getScores() {
  const res = await fetch(API_URL);
  return await res.json();
}