'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'leaderboard.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

function readLeaderboard() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeLeaderboard(data) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/leaderboard – return top 20 scores
app.get('/api/leaderboard', (_req, res) => {
  const data = readLeaderboard();
  res.json(data.slice(0, 20));
});

// POST /api/leaderboard – submit a score
app.post('/api/leaderboard', (req, res) => {
  const { name, score } = req.body;

  if (
    typeof name !== 'string' ||
    name.trim().length === 0 ||
    typeof score !== 'number' ||
    !isFinite(score)
  ) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  const sanitisedName = name.trim().substring(0, 20);
  const sanitisedScore = Math.max(0, Math.floor(score));

  const data = readLeaderboard();
  const entry = {
    name: sanitisedName,
    score: sanitisedScore,
    date: new Date().toISOString(),
  };
  data.push(entry);
  data.sort((a, b) => b.score - a.score);
  const trimmed = data.slice(0, 100);
  writeLeaderboard(trimmed);

  // Rank = 1-based position of this entry's score in the sorted list
  const rank = trimmed.findIndex((e) => e.score <= sanitisedScore) + 1;

  res.json({ success: true, rank });
});

app.listen(PORT, () => {
  console.log(`🐗 Super Knur.io running at http://localhost:${PORT}`);
});
