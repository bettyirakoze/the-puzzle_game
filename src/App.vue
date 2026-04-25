<template>
  <div class="app">

    <!-- ================= WELCOME ================= -->
    <div v-if="screen === 'welcome'">
      <h1>🎮 Puzzle Game</h1>

      <input v-model="playerName" placeholder="Enter your name" />

      <h3>🕹 Last Players</h3>
      <ul>
        <li v-for="(p, i) in recentPlayers" :key="i">
          👤 {{ p.playerName }} |
          {{ p.difficulty }} |
          {{ p.moves }} moves |
          {{ p.time }}s
        </li>
      </ul>

      <button @click="startGame(); screen='game'">Start Game</button>
    </div>

    <!-- ================= GAME ================= -->
    <div v-if="screen === 'game'">

      <h2>🧩 Level: {{ difficulty.toUpperCase() }}</h2>

      <p>Moves: {{ moves }} | Time: {{ time }}s</p>

      <div class="grid">
        <div
          v-for="card in cards"
          :key="card.id"
          class="card"
          :class="{ flipped: card.flipped || card.matched }"
          @click="flipCard(card)"
        >
          {{ card.flipped || card.matched ? card.value : "?" }}
        </div>
      </div>

      <button @click="startGame">Restart</button>

    </div>

    <!-- ================= LEADERBOARD ================= -->
    <div v-if="screen === 'leaderboard'">

      <h1>🏆 Final Leaderboard</h1>

      <ul>
        <li v-for="(s, i) in leaderboard" :key="i">
          #{{ i + 1 }} - {{ s.playerName }} |
          Moves: {{ s.moves }} |
          Time: {{ s.time }}s
        </li>
      </ul>

      <button @click="screen='welcome'">Home</button>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { saveScore, getScores } from "./api/scores";

// ================= STATE =================
const screen = ref("welcome");
const playerName = ref("");

const levelOrder = ["easy", "medium", "hard"];
const currentLevelIndex = ref(0);

const difficulty = ref("easy");

const moves = ref(0);
const time = ref(0);

const cards = ref([]);
const flipped = ref([]);

const leaderboard = ref([]);
const recentPlayers = ref([]);

let timer = null;

// ================= START GAME =================
function startGame() {
  moves.value = 0;
  time.value = 0;
  flipped.value = [];

  clearInterval(timer);
  timer = setInterval(() => time.value++, 1000);

  difficulty.value = levelOrder[currentLevelIndex.value];

  generateCards();
}

// ================= GENERATE CARDS =================
function generateCards() {
  let size =
    difficulty.value === "easy" ? 4 :
    difficulty.value === "medium" ? 6 : 8;

  let values = [];

  for (let i = 1; i <= size / 2; i++) {
    values.push(i, i);
  }

  values.sort(() => Math.random() - 0.5);

  cards.value = values.map((v, i) => ({
    id: i,
    value: v,
    flipped: false,
    matched: false
  }));
}

// ================= FLIP CARD =================
function flipCard(card) {
  if (card.flipped || card.matched || flipped.value.length === 2) return;

  card.flipped = true;
  flipped.value.push(card);

  if (flipped.value.length === 2) {
    moves.value++;

    const [a, b] = flipped.value;

    if (a.value === b.value) {
      a.matched = true;
      b.matched = true;
      flipped.value = [];

      checkWin();
    } else {
      setTimeout(() => {
        a.flipped = false;
        b.flipped = false;
        flipped.value = [];
      }, 600);
    }
  }
}

// ================= CHECK WIN =================
function checkWin() {
  if (cards.value.every(c => c.matched)) {
    onWin();
  }
}

// ================= ON WIN =================
async function onWin() {
  clearInterval(timer);

  // NEXT LEVEL OR FINISH GAME
  if (currentLevelIndex.value < levelOrder.length - 1) {

    currentLevelIndex.value++;

    alert("🎉 Level completed! Next level starting...");

    startGame();
    screen.value = "game";

  } else {

    // FINAL FINISH
    await saveScore({
      playerName: playerName.value || "Player",
      moves: moves.value,
      time: time.value,
      difficulty: "completed-all"
    });

    await loadLeaderboard();

    alert("🏆 You finished ALL levels!");

    currentLevelIndex.value = 0;
    screen.value = "leaderboard";
  }
}

// ================= LEADERBOARD =================
async function loadLeaderboard() {
  const scores = await getScores();

  leaderboard.value = scores
    .sort((a, b) => a.moves - b.moves)
    .slice(0, 10);

  // LAST PLAYERS (WELCOME HISTORY)
  recentPlayers.value = scores.slice(-10).reverse();
}

// ================= INIT =================
onMounted(() => {
  loadLeaderboard();
});
</script>

<style>
.app {
  text-align: center;
  font-family: Arial;
  padding: 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 80px);
  gap: 10px;
  justify-content: center;
  margin: 20px;
}

.card {
  width: 80px;
  height: 80px;
  background: #3498db;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 24px;
  border-radius: 8px;
}

.card.flipped {
  background: #2ecc71;
}

button {
  margin: 10px;
  padding: 8px 12px;
}
</style>