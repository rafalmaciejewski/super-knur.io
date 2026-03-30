# Super Knur.io 🐗

A Super Mario-style platformer game running in the browser, with **Knur** (a wild boar) as the main character.

## Features

- **Lobby** – customise your character's body colour and hat, enter your name, then hit *Start Game* or *Leaderboard*.
- **Platformer game** – arrow keys / WASD to run, Space / ↑ to jump (double-jump supported). Collect coins, stomp enemies, and reach the flag.
- **Leaderboard** – scores are submitted to the server automatically at the end of each run and shown on the leaderboard screen.

## Running locally

```bash
npm install
npm start
# Open http://localhost:3000
```

## Project structure

```
super-knur.io/
├── server.js          – Express server (leaderboard API + static files)
├── public/
│   ├── index.html     – Single-page app (Lobby / Game / Leaderboard screens)
│   ├── css/style.css  – Styling
│   └── js/game.js     – Full game engine (canvas platformer)
└── data/
    └── leaderboard.json  – Persisted scores (auto-created on first run)
```

## API

| Method | Path               | Description               |
|--------|--------------------|---------------------------|
| GET    | `/api/leaderboard` | Fetch top 20 scores       |
| POST   | `/api/leaderboard` | Submit `{ name, score }`  |
