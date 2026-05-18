import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { GAME_CONFIG } from './config/game';
import type {
  GameState,
  VoteTally,
  QuestionConfig,
  ServerToClientEvents,
  ClientToServerEvents,
} from './lib/types';

const dev  = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

const app    = next({ dev });
const handle = app.getRequestHandler();

// Persist questions to disk so admin changes survive restarts
const QUESTIONS_FILE = path.join(process.cwd(), '.questions.json');

function loadQuestions(): QuestionConfig[] {
  try {
    if (fs.existsSync(QUESTIONS_FILE)) {
      const raw = fs.readFileSync(QUESTIONS_FILE, 'utf-8');
      const qs = JSON.parse(raw) as QuestionConfig[];
      if (Array.isArray(qs) && qs.length > 0) return qs;
    }
  } catch { /* ignore corrupt file */ }
  return [...GAME_CONFIG.questions];
}

function saveQuestions(qs: QuestionConfig[]) {
  try { fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(qs, null, 2)); } catch { /* ignore */ }
}

// Server-owned mutable questions — persisted across restarts
let currentQuestions: QuestionConfig[] = loadQuestions();

function initVotes(questions: QuestionConfig[]): VoteTally[] {
  return questions.map((q) => {
    const t: VoteTally = {};
    if (q.answerType === 'monsters') {
      GAME_CONFIG.monsters.forEach((m) => { t[m.id] = 0; });
    } else if (q.answerType === 'mcq' && q.options) {
      q.options.forEach((_, i) => { t[String(i)] = 0; });
    }
    // slider: votes tally unused
    return t;
  });
}

function createInitialState(): GameState {
  const monsterSizes: Record<string, number> = {};
  GAME_CONFIG.monsters.forEach((m) => { monsterSizes[m.id] = GAME_CONFIG.baseSize; });

  return {
    sessionId: uuidv4(),
    status: 'waiting',
    currentSlide: 0,
    timer: GAME_CONFIG.timerDuration,
    timerRunning: false,
    votes: initVotes(currentQuestions),
    monsterSizes,
    playerCount: 0,
    roundWinner: null,
    overallWinner: null,
    questions: [...currentQuestions],
    sliderPositions: currentQuestions.map(() => []),
  };
}

function getOverallWinner(monsterSizes: Record<string, number>): string {
  return Object.entries(monsterSizes).reduce((a, b) => a[1] > b[1] ? a : b)[0];
}

// Proportional sizing: no votes → 1×, max votes → 5×, others linear in between
function computeMonsterSizes(tally: VoteTally): Record<string, number> {
  const sizes: Record<string, number> = {};
  GAME_CONFIG.monsters.forEach((m) => { sizes[m.id] = 1; });
  const maxVotes = Math.max(...GAME_CONFIG.monsters.map((m) => tally[m.id] ?? 0));
  if (maxVotes === 0) return sizes;
  GAME_CONFIG.monsters.forEach((m) => {
    const v = tally[m.id] ?? 0;
    sizes[m.id] = 1 + (v / maxVotes) * 1.0;
  });
  return sizes;
}

app.prepare().then(() => {
  let gameState: GameState = createInitialState();
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  const REVEAL_SECONDS = 10;

  // slide → playerId → chosen key (monsterId for monsters, optionIndex string for MCQ)
  const playerVotes = new Map<number, Map<string, string>>();
  // slide → playerId → 0-1 value
  const sliderVotes = new Map<number, Map<string, number>>();

  const httpServer = createServer(async (req, res) => {
    if (req.url?.startsWith('/api/socketio')) return;
    const parsedUrl = parse(req.url || '/', true);
    await handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      cors: { origin: '*', methods: ['GET', 'POST'] },
      path: '/api/socketio',
    }
  );

  function clearTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  // Generic countdown — calls onExpire when it hits 0
  function startTimer(onExpire: () => void) {
    clearTimer();
    timerInterval = setInterval(() => {
      gameState.timer = Math.max(0, gameState.timer - 1);
      io.emit('state:timer-tick', { timer: gameState.timer });
      if (gameState.timer <= 0) {
        gameState.timerRunning = false;
        clearTimer();
        onExpire();
      }
    }, 1000);
  }

  function advanceSlide() {
    clearTimer();
    const next = gameState.currentSlide + 1;
    if (next >= gameState.questions.length) {
      gameState.status        = 'final';
      gameState.timerRunning  = false;
      gameState.overallWinner = getOverallWinner(gameState.monsterSizes);
      io.emit('state:full', { ...gameState });
    } else {
      // Reset monster sizes to 1× for the new question
      GAME_CONFIG.monsters.forEach((m) => { gameState.monsterSizes[m.id] = 1; });
      gameState.currentSlide = next;
      gameState.status       = 'question';
      gameState.timer        = GAME_CONFIG.timerDuration;
      gameState.timerRunning = true;
      gameState.roundWinner  = null;
      io.emit('state:full', { ...gameState });
      startTimer(revealSlide);
    }
  }

  function revealSlide() {
    clearTimer();
    const slide = gameState.currentSlide;
    const q     = gameState.questions[slide];
    const type  = q?.answerType ?? 'monsters';

    if (type === 'monsters') {
      const tally = gameState.votes[slide];
      let maxVotes = 0;
      let winner   = GAME_CONFIG.monsters[0].id;
      Object.entries(tally).forEach(([id, n]) => {
        if (n > maxVotes) { maxVotes = n; winner = id; }
      });
      const finalSizes = computeMonsterSizes(tally);
      GAME_CONFIG.monsters.forEach((m) => { gameState.monsterSizes[m.id] = finalSizes[m.id]; });
      gameState.roundWinner = maxVotes > 0 ? winner : null;
    } else if (type === 'mcq') {
      const tally = gameState.votes[slide];
      let maxVotes = -1;
      let winner: string | null = null;
      Object.entries(tally).forEach(([key, n]) => {
        if (n > maxVotes) { maxVotes = n; winner = key; }
      });
      gameState.roundWinner = winner;
    } else {
      gameState.roundWinner = null;
    }

    // On the last question, skip the reveal and go straight to final
    const isLastSlide = slide === gameState.questions.length - 1;
    if (isLastSlide) {
      gameState.status        = 'final';
      gameState.timerRunning  = false;
      gameState.overallWinner = getOverallWinner(gameState.monsterSizes);
      io.emit('state:full', { ...gameState });
      return;
    }

    // Start the reveal countdown — ticks down and auto-advances
    gameState.status       = 'revealing';
    gameState.timer        = REVEAL_SECONDS;
    gameState.timerRunning = true;
    io.emit('state:reveal', { winner: gameState.roundWinner, monsterSizes: { ...gameState.monsterSizes } });
    io.emit('state:full', { ...gameState });
    startTimer(advanceSlide);
  }

  async function runDemoMode() {
    const slide = gameState.currentSlide;
    const q     = gameState.questions[slide];
    const type  = q?.answerType ?? 'monsters';
    const count = 20;
    const delay = (gameState.timer * 1000) / count;

    for (let i = 0; i < count; i++) {
      await new Promise((r) => setTimeout(r, delay));
      if (gameState.status !== 'question') break;
      const pid = `demo-${slide}-${i}`;

      if (type === 'slider') {
        if (!sliderVotes.has(slide)) sliderVotes.set(slide, new Map());
        if (sliderVotes.get(slide)!.has(pid)) continue;
        // Cluster answers around 0.3 and 0.75 so the distribution looks interesting
        const val = Math.random() < 0.5
          ? 0.3 + (Math.random() - 0.5) * 0.3
          : 0.75 + (Math.random() - 0.5) * 0.25;
        sliderVotes.get(slide)!.set(pid, Math.max(0, Math.min(1, val)));
        gameState.sliderPositions[slide] = Array.from(sliderVotes.get(slide)!.values());
        io.emit('state:slider-update', { questionIndex: slide, positions: [...gameState.sliderPositions[slide]] });

      } else if (type === 'mcq' && q.options) {
        if (!playerVotes.has(slide)) playerVotes.set(slide, new Map());
        if (playerVotes.get(slide)!.has(pid)) continue;
        const key = String(Math.floor(Math.random() * q.options.length));
        playerVotes.get(slide)!.set(pid, key);
        gameState.votes[slide][key] = (gameState.votes[slide][key] || 0) + 1;
        io.emit('state:vote-update', { votes: gameState.votes.map((t) => ({ ...t })), monsterSizes: { ...gameState.monsterSizes } });

      } else {
        if (!playerVotes.has(slide)) playerVotes.set(slide, new Map());
        if (playerVotes.get(slide)!.has(pid)) continue;
        const monsters = GAME_CONFIG.monsters;
        const weights  = monsters.map((_, idx) => (idx < 2 ? 3 : 1));
        const total    = weights.reduce((a, b) => a + b, 0);
        let rand = Math.random() * total;
        let monsterId = monsters[monsters.length - 1].id;
        for (let j = 0; j < monsters.length; j++) {
          rand -= weights[j];
          if (rand <= 0) { monsterId = monsters[j].id; break; }
        }
        playerVotes.get(slide)!.set(pid, monsterId);
        gameState.votes[slide][monsterId] = (gameState.votes[slide][monsterId] || 0) + 1;
        const demoSizes = computeMonsterSizes(gameState.votes[slide]);
        GAME_CONFIG.monsters.forEach((m) => { gameState.monsterSizes[m.id] = demoSizes[m.id]; });
        io.emit('state:monster-wiggle', { monsterId });
        io.emit('state:vote-update', { votes: gameState.votes.map((t) => ({ ...t })), monsterSizes: { ...gameState.monsterSizes } });
      }
    }
  }

  io.on('connection', (socket) => {
    console.log(`[connect] ${socket.id}`);
    socket.emit('state:full', { ...gameState });

    socket.on('client:register', ({ type }) => {
      if (type === 'player') {
        gameState.playerCount++;
        io.emit('state:player-count', gameState.playerCount);
      }
      socket.on('disconnect', () => {
        if (type === 'player') {
          gameState.playerCount = Math.max(0, gameState.playerCount - 1);
          io.emit('state:player-count', gameState.playerCount);
        }
        console.log(`[disconnect] ${socket.id}`);
      });
    });

    // Monster vote
    socket.on('player:vote', ({ monsterId, playerId }) => {
      if (gameState.status !== 'question') return;
      const slide = gameState.currentSlide;
      if (gameState.questions[slide]?.answerType !== 'monsters') return;

      if (!playerVotes.has(slide)) playerVotes.set(slide, new Map());
      const map  = playerVotes.get(slide)!;
      const prev = map.get(playerId);
      if (prev === monsterId) return;
      if (prev) gameState.votes[slide][prev] = Math.max(0, (gameState.votes[slide][prev] || 0) - 1);
      map.set(playerId, monsterId);
      gameState.votes[slide][monsterId] = (gameState.votes[slide][monsterId] || 0) + 1;
      const liveSizes = computeMonsterSizes(gameState.votes[slide]);
      GAME_CONFIG.monsters.forEach((m) => { gameState.monsterSizes[m.id] = liveSizes[m.id]; });
      io.emit('state:monster-wiggle', { monsterId });
      io.emit('state:vote-update', { votes: gameState.votes.map((t) => ({ ...t })), monsterSizes: { ...gameState.monsterSizes } });
    });

    // MCQ vote
    socket.on('player:mcq', ({ optionIndex, playerId }) => {
      if (gameState.status !== 'question') return;
      const slide = gameState.currentSlide;
      if (gameState.questions[slide]?.answerType !== 'mcq') return;

      if (!playerVotes.has(slide)) playerVotes.set(slide, new Map());
      const map  = playerVotes.get(slide)!;
      const prev = map.get(playerId);
      const key  = String(optionIndex);
      if (prev === key) return;
      if (prev) gameState.votes[slide][prev] = Math.max(0, (gameState.votes[slide][prev] || 0) - 1);
      map.set(playerId, key);
      gameState.votes[slide][key] = (gameState.votes[slide][key] || 0) + 1;
      io.emit('state:vote-update', { votes: gameState.votes.map((t) => ({ ...t })), monsterSizes: { ...gameState.monsterSizes } });
    });

    // Slider submission
    socket.on('player:slider', ({ value, playerId }) => {
      if (gameState.status !== 'question') return;
      const slide = gameState.currentSlide;
      if (gameState.questions[slide]?.answerType !== 'slider') return;

      if (!sliderVotes.has(slide)) sliderVotes.set(slide, new Map());
      sliderVotes.get(slide)!.set(playerId, Math.max(0, Math.min(1, value)));
      gameState.sliderPositions[slide] = Array.from(sliderVotes.get(slide)!.values());
      io.emit('state:slider-update', { questionIndex: slide, positions: [...gameState.sliderPositions[slide]] });
    });

    socket.on('admin:start', () => {
      if (gameState.status !== 'waiting') return;
      gameState.status      = 'question';
      gameState.currentSlide = 0;
      gameState.timer        = GAME_CONFIG.timerDuration;
      gameState.timerRunning = true;
      io.emit('state:full', { ...gameState });
      startTimer(revealSlide);
    });

    socket.on('admin:next-slide', () => advanceSlide());

    socket.on('admin:restart-timer', () => {
      clearTimer();
      gameState.timer        = GAME_CONFIG.timerDuration;
      gameState.timerRunning = true;
      gameState.status       = 'question';
      io.emit('state:full', { ...gameState });
      startTimer(revealSlide);
    });

    socket.on('admin:reveal', () => revealSlide());

    socket.on('admin:demo-mode', () => runDemoMode());

    socket.on('admin:reset', () => {
      clearTimer();
      playerVotes.clear();
      sliderVotes.clear();
      gameState = createInitialState();
      io.emit('state:full', { ...gameState });
    });

    socket.on('admin:update-questions', (questions) => {
      currentQuestions = questions;
      saveQuestions(questions);
      if (gameState.status === 'waiting') {
        // Safe to rebuild all answer structures
        gameState.questions       = [...questions];
        gameState.votes           = initVotes(questions);
        gameState.sliderPositions = questions.map(() => []);
        playerVotes.clear();
        sliderVotes.clear();
      } else {
        // Mid-game: only update question metadata, leave existing answers alone
        gameState.questions = [...questions];
        // Pad votes/sliderPositions arrays if questions were added
        while (gameState.votes.length < questions.length) {
          const q = questions[gameState.votes.length];
          const t: VoteTally = {};
          if (q.answerType === 'mcq' && q.options) {
            q.options.forEach((_, i) => { t[String(i)] = 0; });
          } else if (q.answerType === 'monsters') {
            GAME_CONFIG.monsters.forEach((m) => { t[m.id] = 0; });
          }
          gameState.votes.push(t);
          gameState.sliderPositions.push([]);
        }
      }
      io.emit('state:questions-updated', [...questions]);
      io.emit('state:full', { ...gameState });
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Monster Quiz ready on http://localhost:${port}`);
    console.log(`> Host display: http://localhost:${port}/host`);
    console.log(`> Admin panel:  http://localhost:${port}/admin`);
  });
});
