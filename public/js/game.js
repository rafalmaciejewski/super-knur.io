/* ============================================================
   Super Knur.io – Game Logic
   ============================================================ */

'use strict';

// ──────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────

const CANVAS_W    = 800;
const CANVAS_H    = 500;
const WORLD_W     = 4200;
const GROUND_Y    = 440;   // y of the top surface of the ground
const GRAVITY     = 0.52;
const JUMP_FORCE  = -12.5;
const MOVE_SPEED  = 4.2;

const BODY_COLORS = {
  pink:   '#F4A5A5',
  brown:  '#A0522D',
  gray:   '#778899',
  orange: '#E8820C',
  purple: '#9370DB',
  dark:   '#2C3E50',
};

const HATS = {
  none:   '🚫',
  cowboy: '🤠',
  crown:  '👑',
  cap:    '🧢',
};

// ──────────────────────────────────────────
// COLOUR HELPERS
// ──────────────────────────────────────────

function shadeHex(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r   = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g   = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b   = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// ──────────────────────────────────────────
// DRAWING: KNUR (boar)
// ──────────────────────────────────────────

/**
 * Draw the Knur character.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} sx        Screen x (center-bottom of character = feet)
 * @param {number} sy        Screen y (feet)
 * @param {string} color     Body fill colour (hex)
 * @param {string} hat       Hat id
 * @param {boolean} facingRight
 * @param {number} frame     Animation frame counter
 * @param {boolean} grounded Is the character on the ground?
 */
function drawKnur(ctx, sx, sy, color, hat, facingRight, frame, grounded) {
  const by = sy;          // feet y
  const bcy = by - 26;   // body-centre y

  ctx.save();
  ctx.translate(sx, 0);
  if (!facingRight) ctx.scale(-1, 1);

  const bx = 0;

  // --- Shadow ---
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(bx, by + 4, 18, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Tail (behind body) ---
  ctx.strokeStyle = shadeHex(color, -25);
  ctx.lineWidth   = 3;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(bx - 17, bcy + 4);
  ctx.bezierCurveTo(bx - 30, bcy - 4, bx - 34, bcy - 16, bx - 24, bcy - 20);
  ctx.stroke();

  // --- Back legs (behind body) ---
  const legAnim = grounded ? Math.sin(frame * 0.28) * 4 : 0;
  const darkCol = shadeHex(color, -20);

  ctx.fillStyle   = darkCol;
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth   = 1;

  _leg(ctx, bx - 16, by - 11, 8, 11 + legAnim);
  _leg(ctx, bx - 7,  by - 11, 8, 11 - legAnim);

  // --- Body ---
  ctx.fillStyle   = color;
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.ellipse(bx, bcy, 21, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Belly highlight
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.ellipse(bx - 2, bcy + 5, 13, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Far ear ---
  ctx.fillStyle   = shadeHex(color, -12);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(bx + 3,  bcy - 15);
  ctx.lineTo(bx + 11, bcy - 29);
  ctx.lineTo(bx + 15, bcy - 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- Near ear ---
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(bx - 5,  bcy - 15);
  ctx.lineTo(bx - 13, bcy - 30);
  ctx.lineTo(bx + 1,  bcy - 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner ear
  ctx.fillStyle = 'rgba(255,140,140,0.65)';
  ctx.beginPath();
  ctx.moveTo(bx - 6,  bcy - 16);
  ctx.lineTo(bx - 12, bcy - 27);
  ctx.lineTo(bx,      bcy - 17);
  ctx.closePath();
  ctx.fill();

  // --- Snout ---
  ctx.fillStyle   = shadeHex(color, 22);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.ellipse(bx + 18, bcy + 2, 9, 8, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Nostrils
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(bx + 14.5, bcy + 3.5, 2.4, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(bx + 21,   bcy + 3.5, 2.4, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Tusks ---
  ctx.fillStyle   = '#FFFDE0';
  ctx.strokeStyle = 'rgba(180,160,0,0.5)';
  ctx.lineWidth   = 0.5;
  ctx.beginPath();
  ctx.moveTo(bx + 13, bcy + 8);
  ctx.lineTo(bx + 10, bcy + 18);
  ctx.lineTo(bx + 16, bcy + 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- Eye white ---
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(bx + 9, bcy - 7, 5, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupil
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(bx + 10, bcy - 7, 3, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(bx + 11, bcy - 9, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // --- Front legs (in front of body) ---
  ctx.fillStyle   = shadeHex(color, -8);
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth   = 1;
  _leg(ctx, bx + 2, by - 11, 8, 11 - legAnim);
  _leg(ctx, bx + 11, by - 11, 8, 11 + legAnim);

  // --- Hat ---
  if (hat !== 'none') {
    _drawHat(ctx, bx, bcy, hat);
  }

  ctx.restore();
}

function _leg(ctx, x, y, w, h) {
  const safeH = Math.max(2, h);
  ctx.fillRect(x, y, w, safeH);
  ctx.strokeRect(x, y, w, safeH);
}

function _drawHat(ctx, bx, bcy, hat) {
  switch (hat) {
    case 'cowboy': {
      // Brim
      ctx.fillStyle = '#7B3F00';
      ctx.beginPath();
      ctx.ellipse(bx, bcy - 22, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Crown
      ctx.fillRect(bx - 14, bcy - 44, 28, 24);
      // Top curve
      ctx.beginPath();
      ctx.ellipse(bx, bcy - 44, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Band
      ctx.fillStyle = '#4a1900';
      ctx.fillRect(bx - 14, bcy - 26, 28, 5);
      break;
    }
    case 'crown': {
      ctx.fillStyle   = '#FFD700';
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx - 16, bcy - 20);
      ctx.lineTo(bx - 16, bcy - 40);
      ctx.lineTo(bx - 8,  bcy - 31);
      ctx.lineTo(bx,      bcy - 44);
      ctx.lineTo(bx + 8,  bcy - 31);
      ctx.lineTo(bx + 16, bcy - 40);
      ctx.lineTo(bx + 16, bcy - 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Gems
      ctx.fillStyle = '#FF1744';
      ctx.beginPath();
      ctx.arc(bx, bcy - 25, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00BCD4';
      ctx.beginPath();
      ctx.arc(bx - 10, bcy - 25, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx + 10, bcy - 25, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'cap': {
      // Brim
      ctx.fillStyle = '#CC0000';
      ctx.beginPath();
      ctx.ellipse(bx + 10, bcy - 21, 9, 4, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Main cap
      ctx.beginPath();
      ctx.ellipse(bx - 1, bcy - 26, 17, 8, -0.15, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(bx - 16, bcy - 32, 30, 8);
      ctx.beginPath();
      ctx.ellipse(bx - 1, bcy - 32, 15, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Letter K
      ctx.fillStyle    = 'white';
      ctx.font         = 'bold 9px Arial';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('K', bx - 1, bcy - 27);
      break;
    }
  }
}

// ──────────────────────────────────────────
// DRAWING: ENEMY (mushroom creature)
// ──────────────────────────────────────────

function drawEnemy(ctx, sx, sy, frame, squished) {
  if (squished) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(1.4, 0.35);
    _drawEnemyShape(ctx, 0, 0, frame);
    ctx.restore();
  } else {
    _drawEnemyShape(ctx, sx, sy, frame);
  }
}

function _drawEnemyShape(ctx, sx, sy, frame) {
  const foot = Math.sin(frame * 0.2) * 3;

  // Cap
  ctx.fillStyle = '#8B0000';
  ctx.beginPath();
  ctx.arc(sx, sy - 18, 18, Math.PI, 0, false);
  ctx.fill();

  // Spots
  ctx.fillStyle = 'rgba(255,200,200,0.7)';
  ctx.beginPath();
  ctx.arc(sx - 7, sy - 23, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx + 7, sy - 21, 3, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = '#FFF8DC';
  ctx.fillRect(sx - 12, sy - 18, 24, 18);
  ctx.beginPath();
  ctx.arc(sx - 12, sy, 12, Math.PI * 0.5, Math.PI * 1.5, true);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx + 12, sy, 12, -Math.PI * 0.5, Math.PI * 0.5, false);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.ellipse(sx - 5, sy - 8, 4, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(sx + 5, sy - 8, 4, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(sx - 4, sy - 10, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx + 6, sy - 10, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Feet
  ctx.fillStyle = '#5C3317';
  ctx.beginPath();
  ctx.ellipse(sx - 8,  sy + foot, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(sx + 8, sy - foot, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ──────────────────────────────────────────
// DRAWING: COIN
// ──────────────────────────────────────────

function drawCoin(ctx, sx, sy, frame) {
  const scaleX = Math.abs(Math.cos(frame * 0.08));
  ctx.save();
  ctx.translate(sx, sy);
  ctx.scale(scaleX, 1);

  ctx.fillStyle   = '#FFD700';
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle    = '#FFA500';
  ctx.font         = 'bold 11px Arial';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', 0, 0);

  ctx.restore();
}

// ──────────────────────────────────────────
// ENTITY: Platform
// ──────────────────────────────────────────

class Platform {
  constructor(x, y, width, height = 18) {
    this.x      = x;
    this.y      = y;
    this.width  = width;
    this.height = height;
  }

  draw(ctx, camX) {
    const sx = this.x - camX;
    if (sx + this.width < -10 || sx > CANVAS_W + 10) return; // cull off-screen

    // Grass top
    ctx.fillStyle = '#5DBB3A';
    ctx.fillRect(sx, this.y, this.width, 8);

    // Dirt body
    ctx.fillStyle = '#6B4226';
    ctx.fillRect(sx, this.y + 8, this.width, this.height - 8);

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(sx, this.y, this.width, this.height);

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(sx + 2, this.y + 2, this.width - 4, 3);
  }
}

// ──────────────────────────────────────────
// ENTITY: Coin
// ──────────────────────────────────────────

class CoinObj {
  constructor(x, y) {
    this.x         = x;
    this.y         = y;
    this.collected = false;
    this.frame     = Math.floor(Math.random() * 60); // stagger spin
  }

  update() { this.frame++; }

  draw(ctx, camX) {
    if (this.collected) return;
    drawCoin(ctx, this.x - camX, this.y, this.frame);
  }

  get bounds() {
    return { l: this.x - 10, r: this.x + 10, t: this.y - 10, b: this.y + 10 };
  }
}

// ──────────────────────────────────────────
// ENTITY: Enemy
// ──────────────────────────────────────────

class Enemy {
  constructor(x, y, minX, maxX) {
    this.x      = x;
    this.y      = y;
    this.vx     = 1.4;
    this.minX   = minX;
    this.maxX   = maxX;
    this.alive  = true;
    this.dying  = false;
    this.timer  = 0;
    this.frame  = 0;
  }

  update() {
    if (!this.alive) return;
    if (this.dying) {
      this.timer++;
      if (this.timer > 25) this.alive = false;
      return;
    }
    this.x += this.vx;
    this.frame++;
    if (this.x < this.minX + 15) { this.x = this.minX + 15; this.vx =  Math.abs(this.vx); }
    if (this.x > this.maxX - 15) { this.x = this.maxX - 15; this.vx = -Math.abs(this.vx); }
  }

  die() { this.dying = true; this.timer = 0; }

  draw(ctx, camX) {
    if (!this.alive) return;
    drawEnemy(ctx, this.x - camX, this.y, this.frame, this.dying);
  }

  get bounds() {
    if (this.dying) return { l: 0, r: 0, t: 0, b: 0 }; // no collision while dying
    return { l: this.x - 13, r: this.x + 13, t: this.y - 36, b: this.y + 6 };
  }
}

// ──────────────────────────────────────────
// ENTITY: Player
// ──────────────────────────────────────────

class Player {
  constructor(x, y, config) {
    this.x          = x;
    this.y          = y;          // feet y
    this.vx         = 0;
    this.vy         = 0;
    this.facingRight = true;
    this.frame      = 0;
    this.grounded   = false;
    this.jumpCount  = 0;
    this.invincible = 0;
    this.alive      = true;
    this.config     = config;
    this.prevJump   = false;       // debounce jump key
  }

  update(keys, platforms) {
    if (!this.alive) return;

    // Horizontal
    if (keys.left) {
      this.vx = -MOVE_SPEED;
      this.facingRight = false;
    } else if (keys.right) {
      this.vx = MOVE_SPEED;
      this.facingRight = true;
    } else {
      this.vx *= 0.78;
    }

    // Jump (edge-triggered)
    const jumpHeld = keys.jump;
    if (jumpHeld && !this.prevJump && this.jumpCount < 2) {
      this.vy = JUMP_FORCE;
      this.jumpCount++;
    }
    this.prevJump = jumpHeld;

    // Gravity
    this.vy = Math.min(this.vy + GRAVITY, 18);

    // Move
    this.x += this.vx;
    this.y += this.vy;

    // World bounds
    if (this.x < 22)            this.x = 22;
    if (this.x > WORLD_W - 22)  this.x = WORLD_W - 22;

    // Platform landing (only when falling)
    this.grounded = false;
    if (this.vy >= 0) {
      for (const p of platforms) {
        const prevBottom = this.y - this.vy + 1; // approx prev feet
        const pl = this.x - 18;
        const pr = this.x + 18;
        if (
          pl < p.x + p.width && pr > p.x &&
          prevBottom <= p.y + 1  && this.y >= p.y
        ) {
          this.y        = p.y;
          this.vy       = 0;
          this.grounded = true;
          this.jumpCount = 0;
        }
      }
    }

    // Ground
    if (this.y >= GROUND_Y) {
      this.y        = GROUND_Y;
      this.vy       = 0;
      this.grounded = true;
      this.jumpCount = 0;
    }

    if (Math.abs(this.vx) > 0.5) this.frame++;
    if (this.invincible > 0) this.invincible--;
  }

  draw(ctx, camX) {
    if (!this.alive) return;
    if (this.invincible > 0 && Math.floor(this.invincible / 5) % 2 === 0) return;
    drawKnur(
      ctx,
      this.x - camX,
      this.y,
      this.config.color,
      this.config.hat,
      this.facingRight,
      this.frame,
      this.grounded
    );
  }

  get bounds() {
    return { l: this.x - 18, r: this.x + 18, t: this.y - 52, b: this.y };
  }
}

// ──────────────────────────────────────────
// LEVEL BUILDER
// ──────────────────────────────────────────

function buildLevel() {
  const platforms = [];
  const coins     = [];
  const enemies   = [];

  // Ground (full world width)
  platforms.push(new Platform(0, GROUND_Y, WORLD_W, 60));

  // Floating platform layout: [x, y, width]
  const layout = [
    [180,  360, 110],
    [360,  310, 100],
    [520,  260, 130],
    [720,  220, 100],
    [880,  300, 120],
    [1040, 250, 100],
    [1200, 190, 140],
    [1400, 300, 110],
    [1560, 360, 120],
    [1720, 280, 100],
    [1880, 230, 140],
    [2060, 300, 110],
    [2220, 250, 120],
    [2420, 185, 100],
    [2600, 310, 140],
    [2780, 250, 110],
    [2960, 360, 120],
    [3120, 285, 100],
    [3280, 225, 140],
    [3460, 305, 110],
    [3620, 260, 120],
    [3800, 195, 140],
    [3980, 300, 110],
  ];

  layout.forEach(([x, y, w]) => {
    platforms.push(new Platform(x, y, w));

    // Coins above platform
    coins.push(new CoinObj(x + w / 2, y - 28));
    if (w > 110) {
      coins.push(new CoinObj(x + 28,    y - 28));
      coins.push(new CoinObj(x + w - 28, y - 28));
    }

    // Occasional ground-level coins
    coins.push(new CoinObj(x - 40, GROUND_Y - 28));
  });

  // Extra ground coins
  for (let i = 0; i < 18; i++) {
    coins.push(new CoinObj(100 + i * 220, GROUND_Y - 28));
  }

  // Enemies on every 3rd platform
  layout.forEach(([x, y, w], i) => {
    if (i % 3 === 0 && w >= 100) {
      enemies.push(new Enemy(x + w / 2, y, x, x + w));
    }
  });

  // Ground-patrol enemies: [startX, patrolMinX, patrolMaxX]
  const groundPatrols = [
    { startX:  300, minX:  100, maxX:  700 },
    { startX:  900, minX:  800, maxX: 1500 },
    { startX: 1800, minX: 1700, maxX: 2400 },
    { startX: 2800, minX: 2700, maxX: 3400 },
    { startX: 3500, minX: 3400, maxX: 4100 },
  ];
  groundPatrols.forEach(({ startX, minX, maxX }) => {
    enemies.push(new Enemy(startX, GROUND_Y, minX, maxX));
  });

  return { platforms, coins, enemies };
}

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

function rectsOverlap(a, b) {
  return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ──────────────────────────────────────────
// GAME ENGINE
// ──────────────────────────────────────────

class Game {
  constructor(canvas, playerConfig, onEnd) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.config   = playerConfig;
    this.onEnd    = onEnd;

    this.score    = 0;
    this.lives    = 3;
    this.state    = 'playing'; // 'playing' | 'won' | 'gameover'
    this.frame    = 0;
    this.startMs  = Date.now();

    this.camX     = 0;
    this.keys     = { left: false, right: false, jump: false };
    this.particles = [];
    this.messages  = [];

    const lvl       = buildLevel();
    this.platforms  = lvl.platforms;
    this.coins      = lvl.coins;
    this.enemies    = lvl.enemies;
    this.totalCoins = this.coins.length;

    this.player     = new Player(100, GROUND_Y, playerConfig);

    this._bindKeys();
    this._raf = requestAnimationFrame(this._loop.bind(this));
  }

  _bindKeys() {
    this._kd = (e) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
      this._setKey(e.key, true);
    };
    this._ku = (e) => this._setKey(e.key, false);
    window.addEventListener('keydown', this._kd);
    window.addEventListener('keyup',   this._ku);
  }

  _setKey(key, val) {
    if (key === 'ArrowLeft'  || key === 'a' || key === 'A') this.keys.left  = val;
    if (key === 'ArrowRight' || key === 'd' || key === 'D') this.keys.right = val;
    if (key === 'ArrowUp'    || key === 'w' || key === 'W' || key === ' ')
      this.keys.jump = val;
  }

  destroy() {
    window.removeEventListener('keydown', this._kd);
    window.removeEventListener('keyup',   this._ku);
    cancelAnimationFrame(this._raf);
  }

  _loop() {
    this._update();
    this._draw();
    this._raf = requestAnimationFrame(this._loop.bind(this));
  }

  _update() {
    if (this.state !== 'playing') return;
    this.frame++;

    this.player.update(this.keys, this.platforms);

    // Camera
    this.camX = Math.min(
      Math.max(0, this.player.x - CANVAS_W / 3),
      WORLD_W - CANVAS_W
    );

    // Update entities
    this.enemies.forEach(e => e.update());
    this.coins.forEach(c => c.update());

    const pb = this.player.bounds;

    // Collect coins
    this.coins.forEach(coin => {
      if (coin.collected) return;
      if (rectsOverlap(pb, coin.bounds)) {
        coin.collected = true;
        this.score += 10;
        this._msg('+10', coin.x - this.camX, coin.y - 20, '#FFD700');
        this._burst(coin.x - this.camX, coin.y, '#FFD700', 6);
      }
    });

    // Enemy collisions
    if (this.player.invincible === 0) {
      this.enemies.forEach(enemy => {
        if (!enemy.alive || enemy.dying) return;
        const eb = enemy.bounds;
        if (!rectsOverlap(pb, eb)) return;

        // Stomp: player falling, feet above enemy midpoint
        if (this.player.vy > 1 && pb.b <= (eb.t + eb.b) / 2 + 12) {
          enemy.die();
          this.player.vy = -9;
          this.score += 50;
          this._msg('+50', enemy.x - this.camX, enemy.y - 50, '#FF6F00');
          this._burst(enemy.x - this.camX, enemy.y - 18, '#8B0000', 8);
        } else {
          this.lives--;
          this.player.invincible = 110;
          this._msg('Ouch!', this.player.x - this.camX, this.player.y - 60, '#FF1744');
          if (this.lives <= 0) {
            this.state = 'gameover';
            setTimeout(() => this.onEnd(false, this.score), 800);
          }
        }
      });
    }

    // Fell off world
    if (this.player.y > CANVAS_H + 80) {
      this.lives--;
      this.player.x  = 100;
      this.player.y  = GROUND_Y;
      this.player.vy = 0;
      this.player.vx = 0;
      if (this.lives <= 0) {
        this.state = 'gameover';
        setTimeout(() => this.onEnd(false, this.score), 800);
      }
    }

    // Win: reach end flag zone
    if (this.player.x > WORLD_W - 220) {
      const elapsed    = Math.floor((Date.now() - this.startMs) / 1000);
      const timeBonus  = Math.max(0, 500 - elapsed * 3);
      this.score += timeBonus;
      this.state  = 'won';
      setTimeout(() => this.onEnd(true, this.score), 1500);
    }

    // Particles
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--; });

    // Float messages
    this.messages = this.messages.filter(m => m.life > 0);
    this.messages.forEach(m => { m.y -= 0.9; m.life--; });
  }

  _burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 7,
        vy: (Math.random() - 0.5) * 7 - 2,
        color,
        life: 28 + Math.random() * 18,
      });
    }
  }

  _msg(text, x, y, color) {
    this.messages.push({ text, x, y, color, life: 55 });
  }

  _draw() {
    const ctx = this.ctx;

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    sky.addColorStop(0,   '#5BB8F5');
    sky.addColorStop(0.7, '#ADE1FF');
    sky.addColorStop(1,   '#C8F7C5');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Clouds (parallax)
    this._drawClouds(ctx);

    // Platforms
    this.platforms.forEach(p => p.draw(ctx, this.camX));

    // Coins
    this.coins.forEach(c => c.draw(ctx, this.camX));

    // Enemies
    this.enemies.forEach(e => e.draw(ctx, this.camX));

    // Player
    this.player.draw(ctx, this.camX);

    // End flag
    this._drawFlag(ctx);

    // Particles
    this.particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life / 46);
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Float messages
    this.messages.forEach(m => {
      ctx.globalAlpha  = Math.max(0, m.life / 55);
      ctx.fillStyle    = m.color;
      ctx.font         = 'bold 15px Arial';
      ctx.textAlign    = 'center';
      ctx.fillText(m.text, m.x, m.y);
    });
    ctx.globalAlpha = 1;

    // HUD
    this._drawHUD(ctx);

    // State overlays
    if (this.state === 'gameover') this._drawBanner(ctx, '💀 GAME OVER', '#FF1744');
    if (this.state === 'won')      this._drawBanner(ctx, '🎉 YOU WIN!',  '#FFD700');
  }

  _drawClouds(ctx) {
    const parallax = this.camX * 0.25;
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    const clouds = [[80,55],[260,38],[450,70],[650,48],[850,65],[1060,40]];
    clouds.forEach(([cx, cy]) => {
      const x = ((cx - parallax % CANVAS_W + CANVAS_W * 2) % (CANVAS_W + 200)) - 100;
      ctx.beginPath();
      ctx.arc(x,      cy,      30, 0, Math.PI * 2);
      ctx.arc(x + 28, cy - 12, 24, 0, Math.PI * 2);
      ctx.arc(x + 55, cy,      30, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  _drawFlag(ctx) {
    const fx = WORLD_W - 240 - this.camX;
    if (fx < -60 || fx > CANVAS_W + 60) return;
    const fy = GROUND_Y;
    // Pole
    ctx.fillStyle = '#999';
    ctx.fillRect(fx - 3, fy - 160, 6, 160);
    // Flag body
    ctx.fillStyle = '#e94560';
    ctx.beginPath();
    ctx.moveTo(fx + 3,  fy - 160);
    ctx.lineTo(fx + 48, fy - 138);
    ctx.lineTo(fx + 3,  fy - 116);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle    = 'white';
    ctx.font         = 'bold 11px Arial';
    ctx.textAlign    = 'left';
    ctx.fillText('GOAL', fx + 8, fy - 136);
    // Ball
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(fx, fy - 163, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawHUD(ctx) {
    const pad = (text, x, y, w) => {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(x, y, w, 32);
      ctx.fillStyle = '#fff';
      ctx.font      = 'bold 13px "Courier New"';
      ctx.textAlign = 'left';
      ctx.fillText(text, x + 8, y + 21);
    };

    pad(`Score: ${this.score}`,  8,  8, 155);
    pad(`Lives: ${'🐗'.repeat(Math.max(0, this.lives))}`, CANVAS_W - 148, 8, 140);

    const collected = this.coins.filter(c => c.collected).length;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(CANVAS_W / 2 - 75, 8, 150, 32);
    ctx.fillStyle    = '#FFD700';
    ctx.font         = 'bold 13px "Courier New"';
    ctx.textAlign    = 'center';
    ctx.fillText(`Coins: ${collected}/${this.totalCoins}`, CANVAS_W / 2, 29);

    // Player name tag
    ctx.fillStyle    = 'rgba(255,255,255,0.7)';
    ctx.font         = '11px "Courier New"';
    ctx.textAlign    = 'left';
    ctx.fillText(this.config.name, 10, 55);
  }

  _drawBanner(ctx, text, color) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle    = color;
    ctx.font         = 'bold 52px "Courier New"';
    ctx.textAlign    = 'center';
    ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font      = '22px "Courier New"';
    ctx.fillText(`Score: ${this.score}`, CANVAS_W / 2, CANVAS_H / 2 + 30);
  }
}

// ──────────────────────────────────────────
// APP CONTROLLER
// ──────────────────────────────────────────

class App {
  constructor() {
    this.playerConfig = {
      name:  '',
      color: '#F4A5A5',
      hat:   'none',
    };
    this.currentGame = null;

    this._previewCtx = document.getElementById('preview-canvas').getContext('2d');
    this._initLobby();
    this._initGameScreen();
    this._initLeaderboard();
    this._renderPreview();
  }

  // ---------- LOBBY ----------

  _initLobby() {
    // Color buttons
    const colorWrap = document.getElementById('color-options');
    Object.values(BODY_COLORS).forEach((hex) => {
      const btn = document.createElement('button');
      btn.className            = 'color-btn';
      btn.style.backgroundColor = hex;
      btn.title                = hex;
      if (hex === this.playerConfig.color) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        colorWrap.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.playerConfig.color = hex;
        this._renderPreview();
      });
      colorWrap.appendChild(btn);
    });

    // Hat buttons
    const hatWrap = document.getElementById('hat-options');
    Object.entries(HATS).forEach(([id, emoji]) => {
      const btn    = document.createElement('button');
      btn.className = `hat-btn${id === this.playerConfig.hat ? ' selected' : ''}`;
      btn.dataset.hat = id;
      btn.textContent = emoji;
      btn.title       = id;
      btn.addEventListener('click', () => {
        hatWrap.querySelectorAll('.hat-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.playerConfig.hat = id;
        this._renderPreview();
      });
      hatWrap.appendChild(btn);
    });

    // Name input
    document.getElementById('player-name').addEventListener('input', e => {
      this.playerConfig.name = e.target.value;
      this._renderPreview();
    });

    // Start Game
    document.getElementById('start-game-btn').addEventListener('click', () => {
      const name = this.playerConfig.name.trim();
      if (!name) {
        const inp = document.getElementById('player-name');
        inp.classList.add('error');
        inp.focus();
        setTimeout(() => inp.classList.remove('error'), 500);
        return;
      }
      this._showScreen('game-screen');
      this._startGame();
    });

    // Leaderboard
    document.getElementById('leaderboard-btn').addEventListener('click', () => {
      this._showScreen('leaderboard-screen');
      this._loadLeaderboard();
    });
  }

  _renderPreview() {
    const ctx = this._previewCtx;
    ctx.clearRect(0, 0, 130, 130);

    // Background
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, 130, 130);

    // Ground line
    ctx.fillStyle = '#5DBB3A';
    ctx.fillRect(0, 100, 130, 5);
    ctx.fillStyle = '#6B4226';
    ctx.fillRect(0, 105, 130, 25);

    drawKnur(ctx, 65, 100, this.playerConfig.color, this.playerConfig.hat, true, 0, true);

    if (this.playerConfig.name) {
      ctx.fillStyle    = 'rgba(255,255,255,0.85)';
      ctx.font         = '10px "Courier New"';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(this.playerConfig.name.substring(0, 12), 65, 128);
    }
  }

  // ---------- GAME ----------

  _initGameScreen() {
    document.getElementById('play-again-btn').addEventListener('click', () => {
      document.getElementById('game-overlay').classList.add('hidden');
      this._startGame();
    });
    document.getElementById('back-lobby-btn').addEventListener('click', () => {
      this._destroyGame();
      document.getElementById('game-overlay').classList.add('hidden');
      this._showScreen('lobby-screen');
    });
  }

  _startGame() {
    this._destroyGame();
    const canvas     = document.getElementById('game-canvas');
    this.currentGame = new Game(canvas, this.playerConfig, (won, score) => {
      this._onGameEnd(won, score);
    });
  }

  _destroyGame() {
    if (this.currentGame) {
      this.currentGame.destroy();
      this.currentGame = null;
    }
  }

  async _onGameEnd(won, score) {
    // Submit score to server
    try {
      await fetch('/api/leaderboard', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: this.playerConfig.name.trim(), score }),
      });
    } catch (err) {
      console.warn('Could not submit score:', err);
    }

    // Show overlay
    document.getElementById('result-title').textContent  = won ? '🎉 Victory!' : '💀 Game Over';
    document.getElementById('result-title').style.color  = won ? '#FFD700' : '#FF1744';
    document.getElementById('result-score').textContent  = `Score: ${score}`;
    document.getElementById('game-overlay').classList.remove('hidden');
  }

  // ---------- LEADERBOARD ----------

  _initLeaderboard() {
    document.getElementById('back-from-lb-btn').addEventListener('click', () => {
      this._showScreen('lobby-screen');
    });
  }

  async _loadLeaderboard() {
    const tbody = document.getElementById('lb-body');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#aaa">Loading…</td></tr>';

    try {
      const res  = await fetch('/api/leaderboard');
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#aaa">No scores yet – be the first!</td></tr>';
        return;
      }

      const medals = ['🥇', '🥈', '🥉'];
      tbody.innerHTML = data.map((entry, i) => `
        <tr class="${i < 3 ? `lb-rank-${i + 1}` : ''}">
          <td>${medals[i] || i + 1}</td>
          <td>${escapeHtml(entry.name)}</td>
          <td>${entry.score}</td>
          <td>${new Date(entry.date).toLocaleDateString()}</td>
        </tr>
      `).join('');
    } catch {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#aaa">Failed to load scores</td></tr>';
    }
  }

  // ---------- SCREEN ROUTING ----------

  _showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }
}

// ──────────────────────────────────────────
// BOOTSTRAP
// ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => new App());
