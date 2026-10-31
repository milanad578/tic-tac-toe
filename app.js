/**
 * NEXUS TIC-TAC-TOE
 * A polished, modern web game with AI difficulty tiers,
 * Web Audio sound synthesis, SVG animations, and full responsiveness.
 */

// --- Game State ---
const state = {
  board: Array(9).fill(''),
  currentPlayer: 'X',
  gameMode: 'ai', // 'ai' or 'pvp'
  aiDifficulty: 'medium', // 'easy', 'medium', 'unbeatable'
  isGameActive: true,
  isAiThinking: false,
  soundEnabled: true,
  scores: {
    x: 0,
    o: 0,
    tie: 0
  }
};

// Winning lines definition with SVG line coordinates (based on 300x300 viewBox)
const WINNING_COMBOS = [
  { combo: [0, 1, 2], line: { x1: 20, y1: 50, x2: 280, y2: 50 } },      // Row 0
  { combo: [3, 4, 5], line: { x1: 20, y1: 150, x2: 280, y2: 150 } },    // Row 1
  { combo: [6, 7, 8], line: { x1: 20, y1: 250, x2: 280, y2: 250 } },    // Row 2
  { combo: [0, 3, 6], line: { x1: 50, y1: 20, x2: 50, y2: 280 } },      // Col 0
  { combo: [1, 4, 7], line: { x1: 150, y1: 20, x2: 150, y2: 280 } },    // Col 1
  { combo: [2, 5, 8], line: { x1: 250, y1: 20, x2: 250, y2: 280 } },    // Col 2
  { combo: [0, 4, 8], line: { x1: 30, y1: 30, x2: 270, y2: 270 } },     // Diagonal top-left -> bottom-right
  { combo: [2, 4, 6], line: { x1: 270, y1: 30, x2: 30, y2: 270 } }      // Diagonal top-right -> bottom-left
];

// --- DOM Elements ---
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('statusMessage');
const turnIndicator = document.getElementById('turnIndicator');
const activeSymbol = document.getElementById('activeSymbol');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreTieEl = document.getElementById('scoreTie');
const labelPlayerO = document.getElementById('labelPlayerO');
const cardPlayerX = document.getElementById('cardPlayerX');
const cardPlayerO = document.getElementById('cardPlayerO');

const modeAiBtn = document.getElementById('modeAi');
const modePvpBtn = document.getElementById('modePvp');
const aiDifficultyWrapper = document.getElementById('aiDifficultyWrapper');
const diffButtons = document.querySelectorAll('.diff-btn');

const restartBtn = document.getElementById('restartBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const soundToggle = document.getElementById('soundToggle');
const soundOnIcon = document.getElementById('soundOnIcon');
const soundOffIcon = document.getElementById('soundOffIcon');
const helpBtn = document.getElementById('helpBtn');

const modalOverlay = document.getElementById('modalOverlay');
const modalBadge = document.getElementById('modalBadge');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const modalPlayAgainBtn = document.getElementById('modalPlayAgainBtn');
const modalCloseBtn = document.getElementById('modalCloseBtn');

const helpModal = document.getElementById('helpModal');
const helpCloseBtn = document.getElementById('helpCloseBtn');

const winningLine = document.getElementById('winningLine');
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// --- Web Audio Synthesizer (Zero External Audio Files Needed) ---
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type = 'sine', duration = 0.12, volume = 0.15) {
  if (!state.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
}

const sounds = {
  click() {
    playTone(600, 'sine', 0.04, 0.08);
  },
  moveX() {
    playTone(520, 'triangle', 0.1, 0.18);
  },
  moveO() {
    playTone(380, 'sine', 0.12, 0.2);
  },
  win() {
    if (!state.soundEnabled) return;
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio fanfare
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 'triangle', 0.22, 0.2);
      }, idx * 110);
    });
  },
  tie() {
    if (!state.soundEnabled) return;
    playTone(330, 'sine', 0.2, 0.18);
    setTimeout(() => playTone(300, 'sine', 0.35, 0.15), 180);
  }
};

// --- Confetti Particle System ---
let confettiParticles = [];
let confettiAnimationId = null;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function launchConfetti() {
  if (!ctx || !canvas) return;
  confettiParticles = [];
  const colors = ['#00f0ff', '#ff2a85', '#f59e0b', '#10b981', '#7928ca', '#ffffff'];

  for (let i = 0; i < 90; i++) {
    confettiParticles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.45,
      r: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 16,
      gravity: 0.35,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
  animateConfetti();
}

function animateConfetti() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let alive = false;
  confettiParticles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.98;
    p.rotation += p.vRot;
    p.opacity -= 0.008;

    if (p.opacity > 0 && p.y < canvas.height + 20) {
      alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 1.5);
      ctx.restore();
    }
  });

  if (alive) {
    confettiAnimationId = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// --- Local Storage Management ---
function loadPersistedData() {
  try {
    const savedScores = localStorage.getItem('nexus_ttt_scores');
    if (savedScores) {
      state.scores = JSON.parse(savedScores);
      updateScoreboardUI();
    }
    const savedSound = localStorage.getItem('nexus_ttt_sound');
    if (savedSound !== null) {
      state.soundEnabled = JSON.parse(savedSound);
      updateSoundUI();
    }
  } catch (e) {
    console.warn('Storage unavailable', e);
  }
}

function persistScores() {
  try {
    localStorage.setItem('nexus_ttt_scores', JSON.stringify(state.scores));
  } catch (e) {
    console.warn(e);
  }
}

function persistSound() {
  try {
    localStorage.setItem('nexus_ttt_sound', JSON.stringify(state.soundEnabled));
  } catch (e) {
    console.warn(e);
  }
}

// --- UI Updates ---
function updateScoreboardUI() {
  scoreXEl.textContent = state.scores.x;
  scoreOEl.textContent = state.scores.o;
  scoreTieEl.textContent = state.scores.tie;
}

function updateSoundUI() {
  if (state.soundEnabled) {
    soundOnIcon.classList.remove('hidden');
    soundOffIcon.classList.add('hidden');
  } else {
    soundOnIcon.classList.add('hidden');
    soundOffIcon.classList.remove('hidden');
  }
}

function updateTurnIndicator() {
  activeSymbol.textContent = state.currentPlayer === 'X' ? '✕' : '◯';

  if (state.currentPlayer === 'X') {
    turnIndicator.className = 'turn-badge x-turn';
    cardPlayerX.classList.add('active-card');
    cardPlayerO.classList.remove('active-card');
    statusMessage.textContent = "Player X's Turn";
  } else {
    turnIndicator.className = 'turn-badge o-turn';
    cardPlayerO.classList.add('active-card');
    cardPlayerX.classList.remove('active-card');
    statusMessage.textContent = state.gameMode === 'ai' ? 'AI Bot is thinking...' : "Player O's Turn";
  }
}

function drawWinningLine(lineCoords, winner) {
  winningLine.setAttribute('x1', lineCoords.x1);
  winningLine.setAttribute('y1', lineCoords.y1);
  winningLine.setAttribute('x2', lineCoords.x2);
  winningLine.setAttribute('y2', lineCoords.y2);

  const color = winner === 'X' ? 'var(--color-x)' : 'var(--color-o)';
  winningLine.style.stroke = color;
  winningLine.style.filter = `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color})`;

  // Trigger stroke draw animation
  void winningLine.offsetWidth;
  winningLine.classList.add('draw-line');
}

function clearWinningLine() {
  winningLine.classList.remove('draw-line');
  winningLine.setAttribute('x1', 0);
  winningLine.setAttribute('y1', 0);
  winningLine.setAttribute('x2', 0);
  winningLine.setAttribute('y2', 0);
}

// --- Game Logic ---
function handleCellClick(e) {
  const cell = e.currentTarget;
  const index = parseInt(cell.dataset.index, 10);

  // Ignore if cell taken, game inactive, or AI turn
  if (state.board[index] !== '' || !state.isGameActive || state.isAiThinking) {
    return;
  }

  makeMove(index, state.currentPlayer);

  // If game is still active and against AI, let AI take its turn
  if (state.isGameActive && state.gameMode === 'ai' && state.currentPlayer === 'O') {
    state.isAiThinking = true;
    updateTurnIndicator();

    const thinkDelay = state.aiDifficulty === 'unbeatable' ? 450 : 350;
    setTimeout(() => {
      const aiMove = computeAiMove();
      if (aiMove !== null && state.isGameActive) {
        makeMove(aiMove, 'O');
      }
      state.isAiThinking = false;
      if (state.isGameActive) {
        updateTurnIndicator();
      }
    }, thinkDelay);
  }
}

function makeMove(index, player) {
  state.board[index] = player;
  const cell = cells[index];
  cell.textContent = player === 'X' ? '✕' : '◯';
  cell.classList.add('taken', player.toLowerCase());

  if (player === 'X') {
    sounds.moveX();
  } else {
    sounds.moveO();
  }

  const result = checkWinOrDraw(state.board);

  if (result.winner) {
    handleGameOver(result);
  } else if (result.isDraw) {
    handleGameOver({ winner: null, isDraw: true });
  } else {
    // Switch turn
    state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
  }
}

function checkWinOrDraw(board) {
  for (const winCombo of WINNING_COMBOS) {
    const [a, b, c] = winCombo.combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        winningCombo: winCombo.combo,
        line: winCombo.line,
        isDraw: false
      };
    }
  }

  const isFull = board.every((c) => c !== '');
  return { winner: null, isDraw: isFull };
}

function handleGameOver(result) {
  state.isGameActive = false;

  if (result.winner) {
    const winner = result.winner;
    state.scores[winner.toLowerCase()]++;
    persistScores();
    updateScoreboardUI();

    // Highlight winning cells
    result.winningCombo.forEach((idx) => {
      cells[idx].classList.add('winning-cell');
    });

    // Draw SVG Line
    drawWinningLine(result.line, winner);

    // Audio & Visual Fanfare
    sounds.win();
    launchConfetti();

    // Update Banner
    const winnerName = winner === 'X' ? 'Player X' : (state.gameMode === 'ai' ? 'AI Bot' : 'Player O');
    statusMessage.textContent = `${winnerName} Wins!`;

    // Modal popup after short dramatic delay
    setTimeout(() => {
      modalBadge.textContent = '👑';
      modalTitle.textContent = `${winnerName} Victorious!`;
      modalSubtitle.textContent = `A stellar performance! Ready for another round?`;
      modalOverlay.classList.remove('hidden');
    }, 850);
  } else if (result.isDraw) {
    state.scores.tie++;
    persistScores();
    updateScoreboardUI();

    sounds.tie();
    statusMessage.textContent = "It's a Stalemate!";

    setTimeout(() => {
      modalBadge.textContent = '🤝';
      modalTitle.textContent = "It's a Draw!";
      modalSubtitle.textContent = 'Two sharp minds perfectly balanced. Rematch to settle it?';
      modalOverlay.classList.remove('hidden');
    }, 700);
  }
}

// --- AI Algorithms ---
function computeAiMove() {
  const emptyIndices = state.board
    .map((val, idx) => (val === '' ? idx : null))
    .filter((v) => v !== null);

  if (emptyIndices.length === 0) return null;

  // 1. Easy Mode: Mostly random (85%), occasionally smart
  if (state.aiDifficulty === 'easy') {
    if (Math.random() < 0.85) {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }
    return findImmediateWinOrBlock() ?? emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // 2. Medium Mode: Attacks immediate wins, blocks human wins, takes center, otherwise random
  if (state.aiDifficulty === 'medium') {
    const immediateMove = findImmediateWinOrBlock();
    if (immediateMove !== null) return immediateMove;

    if (state.board[4] === '') return 4; // Take center

    // Take any corner
    const corners = [0, 2, 6, 8].filter((idx) => state.board[idx] === '');
    if (corners.length > 0 && Math.random() < 0.7) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // 3. Unbeatable Mode: Minimax (Mathematically Optimal)
  return getBestMinimaxMove();
}

function findImmediateWinOrBlock() {
  // Can AI ('O') win in 1 move?
  for (const win of WINNING_COMBOS) {
    const [a, b, c] = win.combo;
    const line = [state.board[a], state.board[b], state.board[c]];
    if (line.filter((x) => x === 'O').length === 2 && line.includes('')) {
      return win.combo[line.indexOf('')];
    }
  }

  // Can Human ('X') win in 1 move? Block it!
  for (const win of WINNING_COMBOS) {
    const [a, b, c] = win.combo;
    const line = [state.board[a], state.board[b], state.board[c]];
    if (line.filter((x) => x === 'X').length === 2 && line.includes('')) {
      return win.combo[line.indexOf('')];
    }
  }

  return null;
}

function getBestMinimaxMove() {
  let bestScore = -Infinity;
  let bestMove = null;

  const currentBoard = [...state.board];

  for (let i = 0; i < 9; i++) {
    if (currentBoard[i] === '') {
      currentBoard[i] = 'O';
      const score = minimax(currentBoard, 0, false);
      currentBoard[i] = '';

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

function minimax(board, depth, isMaximizing) {
  const result = checkWinOrDraw(board);
  if (result.winner === 'O') return 10 - depth;
  if (result.winner === 'X') return depth - 10;
  if (result.isDraw) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'O';
        const evaluation = minimax(board, depth + 1, false);
        board[i] = '';
        maxEval = Math.max(maxEval, evaluation);
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'X';
        const evaluation = minimax(board, depth + 1, true);
        board[i] = '';
        minEval = Math.min(minEval, evaluation);
      }
    }
    return minEval;
  }
}

// --- Controls & Reset Handlers ---
function resetRound() {
  sounds.click();
  state.board = Array(9).fill('');
  state.currentPlayer = 'X';
  state.isGameActive = true;
  state.isAiThinking = false;

  cells.forEach((cell) => {
    cell.textContent = '';
    cell.className = 'cell';
  });

  clearWinningLine();
  modalOverlay.classList.add('hidden');
  updateTurnIndicator();
}

function resetAllScores() {
  sounds.click();
  state.scores = { x: 0, o: 0, tie: 0 };
  persistScores();
  updateScoreboardUI();
}

function setGameMode(mode) {
  if (state.gameMode === mode) return;
  sounds.click();
  state.gameMode = mode;

  if (mode === 'ai') {
    modeAiBtn.classList.add('active');
    modeAiBtn.setAttribute('aria-selected', 'true');
    modePvpBtn.classList.remove('active');
    modePvpBtn.setAttribute('aria-selected', 'false');
    aiDifficultyWrapper.classList.remove('hidden');
    labelPlayerO.textContent = 'AI Bot';
  } else {
    modePvpBtn.classList.add('active');
    modePvpBtn.setAttribute('aria-selected', 'true');
    modeAiBtn.classList.remove('active');
    modeAiBtn.setAttribute('aria-selected', 'false');
    aiDifficultyWrapper.classList.add('hidden');
    labelPlayerO.textContent = 'Player O';
  }

  resetRound();
}

function setAiDifficulty(diff) {
  sounds.click();
  state.aiDifficulty = diff;
  diffButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.diff === diff);
  });
}

// --- Event Listeners ---
cells.forEach((cell) => {
  cell.addEventListener('click', handleCellClick);
  // Keyboard access
  cell.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cell.click();
    }
  });
});

modeAiBtn.addEventListener('click', () => setGameMode('ai'));
modePvpBtn.addEventListener('click', () => setGameMode('pvp'));

diffButtons.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    setAiDifficulty(e.currentTarget.dataset.diff);
  });
});

restartBtn.addEventListener('click', resetRound);
resetScoreBtn.addEventListener('click', resetAllScores);
modalPlayAgainBtn.addEventListener('click', resetRound);
modalCloseBtn.addEventListener('click', () => modalOverlay.classList.add('hidden'));

soundToggle.addEventListener('click', () => {
  state.soundEnabled = !state.soundEnabled;
  persistSound();
  updateSoundUI();
  sounds.click();
});

helpBtn.addEventListener('click', () => {
  sounds.click();
  helpModal.classList.remove('hidden');
});

helpCloseBtn.addEventListener('click', () => {
  sounds.click();
  helpModal.classList.add('hidden');
});

// Modal close when clicking backdrop
[modalOverlay, helpModal].forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('hidden');
    }
  });
});

// --- Initialize App ---
loadPersistedData();
updateTurnIndicator();
