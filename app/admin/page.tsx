'use client';

import { useEffect, useRef, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { GAME_CONFIG } from '@/config/game';
import type { GameState, QuestionConfig, QuestionAnswerType } from '@/lib/types';

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: GameState = {
  sessionId: '',
  status: 'waiting',
  currentSlide: 0,
  timer: GAME_CONFIG.timerDuration,
  timerRunning: false,
  votes: GAME_CONFIG.questions.map(() => {
    const t: Record<string, number> = {};
    GAME_CONFIG.monsters.forEach((m) => (t[m.id] = 0));
    return t;
  }),
  monsterSizes: Object.fromEntries(GAME_CONFIG.monsters.map((m) => [m.id, 1])),
  playerCount: 0,
  roundWinner: null,
  overallWinner: null,
  questions: GAME_CONFIG.questions,
  sliderPositions: GAME_CONFIG.questions.map(() => []),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Btn({
  onClick,
  disabled,
  variant = 'default',
  size = 'md',
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'lime' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}) {
  const base = `rounded-xl font-oscar font-semibold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95`;
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-3 text-sm' };
  const variants = {
    default: 'bg-slate/40 text-mist hover:bg-slate/60',
    lime:    'bg-lime text-ink hover:bg-lime/80',
    danger:  'bg-red-600/70 text-mist hover:bg-red-600',
    ghost:   'text-fog hover:text-mist border border-slate/40 hover:border-slate',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]}`}>
      {children}
    </button>
  );
}

const TYPE_LABELS: Record<QuestionAnswerType, string> = {
  monsters: 'Monsters',
  mcq:      'Text (MCQ)',
  slider:   'Slider',
};

// ─── Question editor ──────────────────────────────────────────────────────────

function QuestionEditor({
  question,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  question: QuestionConfig;
  index: number;
  total: number;
  onChange: (q: QuestionConfig) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const set = (patch: Partial<QuestionConfig>) => onChange({ ...question, ...patch });

  return (
    <div className="bg-slate/20 rounded-2xl p-4 space-y-3">
      {/* Question number + move + delete */}
      <div className="flex items-center gap-2">
        <span className="text-fog text-xs font-oscar uppercase tracking-widest w-6 shrink-0">
          Q{index + 1}
        </span>
        <input
          className="flex-1 bg-slate/30 text-mist font-oscar text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-lime/50 placeholder:text-slate"
          value={question.text}
          placeholder="Question text…"
          onChange={(e) => set({ text: e.target.value })}
        />
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-fog hover:text-mist disabled:opacity-25 transition-colors text-xs"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-fog hover:text-mist disabled:opacity-25 transition-colors text-xs"
          >
            ↓
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-fog hover:text-red-400 transition-colors text-sm"
          >
            ×
          </button>
        </div>
      </div>

      {/* Answer type selector */}
      <div className="flex gap-1">
        {(['monsters', 'mcq', 'slider'] as QuestionAnswerType[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              const patch: Partial<QuestionConfig> = { answerType: type };
              if (type === 'mcq' && !question.options?.length) {
                patch.options = ['Strongly Disagree', 'Somewhat Disagree', 'Somewhat Agree', 'Strongly Agree'];
              }
              if (type === 'slider') {
                patch.leftLabel  = patch.leftLabel  ?? question.leftLabel  ?? 'Not at all';
                patch.rightLabel = patch.rightLabel ?? question.rightLabel ?? 'Absolutely';
              }
              set(patch);
            }}
            className={`px-3 py-1.5 rounded-lg font-oscar text-xs uppercase tracking-wider transition-colors ${
              question.answerType === type
                ? 'bg-lime text-ink'
                : 'bg-slate/30 text-fog hover:text-mist'
            }`}
          >
            {TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* MCQ options */}
      {question.answerType === 'mcq' && (
        <div className="space-y-2 pl-2">
          {(question.options ?? []).map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <span className="text-fog text-xs font-oscar w-4 shrink-0">{oi + 1}.</span>
              <input
                className="flex-1 bg-slate/30 text-mist font-oscar text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-lime/50 placeholder:text-slate"
                value={opt}
                placeholder={`Option ${oi + 1}`}
                onChange={(e) => {
                  const options = [...(question.options ?? [])];
                  options[oi] = e.target.value;
                  set({ options });
                }}
              />
              {(question.options?.length ?? 0) > 2 && (
                <button
                  onClick={() => {
                    const options = (question.options ?? []).filter((_, i) => i !== oi);
                    set({ options });
                  }}
                  className="text-fog hover:text-red-400 transition-colors text-sm w-6 shrink-0"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {(question.options?.length ?? 0) < 6 && (
            <button
              onClick={() => set({ options: [...(question.options ?? []), ''] })}
              className="text-lime text-xs font-oscar uppercase tracking-wider hover:text-lime/70 transition-colors pl-6"
            >
              + Add option
            </button>
          )}
        </div>
      )}

      {/* Slider labels */}
      {question.answerType === 'slider' && (
        <div className="grid grid-cols-2 gap-3 pl-2">
          <div>
            <p className="text-fog text-xs font-oscar uppercase tracking-widest mb-1">Left label</p>
            <input
              className="w-full bg-slate/30 text-mist font-oscar text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-lime/50 placeholder:text-slate"
              value={question.leftLabel ?? ''}
              placeholder="e.g. Not at all"
              onChange={(e) => set({ leftLabel: e.target.value })}
            />
          </div>
          <div>
            <p className="text-fog text-xs font-oscar uppercase tracking-widest mb-1">Right label</p>
            <input
              className="w-full bg-slate/30 text-mist font-oscar text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-lime/50 placeholder:text-slate"
              value={question.rightLabel ?? ''}
              placeholder="e.g. Absolutely"
              onChange={(e) => set({ rightLabel: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isConnected, setIsConnected] = useState(false);
  const [appUrl, setAppUrl]     = useState('');
  const [tab, setTab]           = useState<'live' | 'questions'>('live');

  // Local question editor state — initialised once from server
  const [editedQuestions, setEditedQuestions] = useState<QuestionConfig[]>([]);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const initialized = useRef(false);
  const saveTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAppUrl(window.location.origin);
    const socket = getSocket();

    socket.on('connect',    () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('state:full', (state) => {
      const merged = {
        ...INITIAL_STATE,
        ...state,
        questions:       state.questions       ?? INITIAL_STATE.questions,
        sliderPositions: state.sliderPositions ?? INITIAL_STATE.sliderPositions,
      };
      setGameState(merged);
      if (!initialized.current && merged.questions.length > 0) {
        initialized.current = true;
        setEditedQuestions(merged.questions);
      }
    });

    socket.on('state:timer-tick', ({ timer }) =>
      setGameState((prev) => ({ ...prev, timer }))
    );
    socket.on('state:vote-update', ({ votes, monsterSizes }) =>
      setGameState((prev) => ({ ...prev, votes, monsterSizes }))
    );
    socket.on('state:reveal', ({ winner, monsterSizes }) =>
      setGameState((prev) => ({ ...prev, status: 'revealing', roundWinner: winner, monsterSizes }))
    );
    socket.on('state:player-count', (count) =>
      setGameState((prev) => ({ ...prev, playerCount: count }))
    );

    socket.emit('client:register', { type: 'admin' });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('state:full');
      socket.off('state:timer-tick');
      socket.off('state:vote-update');
      socket.off('state:reveal');
      socket.off('state:player-count');
    };
  }, []);

  // Debounced auto-save questions
  const updateQuestions = (qs: QuestionConfig[]) => {
    setEditedQuestions(qs);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      getSocket().emit('admin:update-questions', qs);
    }, 400);
  };

  const saveNow = (qs: QuestionConfig[] = editedQuestions) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    getSocket().emit('admin:update-questions', qs);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  const addQuestion = () => {
    const newQ: QuestionConfig = {
      id: Date.now(),
      text: '',
      answerType: 'monsters',
    };
    updateQuestions([...editedQuestions, newQ]);
  };

  const updateQ = (i: number, q: QuestionConfig) => {
    const next = [...editedQuestions];
    next[i] = q;
    updateQuestions(next);
  };

  const deleteQ = (i: number) => {
    updateQuestions(editedQuestions.filter((_, idx) => idx !== i));
  };

  const moveQ = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= editedQuestions.length) return;
    const next = [...editedQuestions];
    [next[i], next[j]] = [next[j], next[i]];
    updateQuestions(next);
  };

  const sk = () => getSocket();
  const currentVotes = gameState.votes[gameState.currentSlide] || {};
  const totalVotes   = Object.values(currentVotes).reduce((a, b) => a + b, 0);
  const playUrl  = appUrl ? `${appUrl}/play/${gameState.sessionId}` : '';
  const hostUrl  = appUrl ? `${appUrl}/host` : '';
  const currentQ = gameState.questions?.[gameState.currentSlide];

  return (
    <div className="min-h-screen bg-ink text-mist font-oscar">
      {/* Header */}
      <div className="border-b border-slate/30 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-lime uppercase tracking-widest">Monster Quiz</h1>
        <div className="flex items-center gap-3">
          <span className="text-fog text-xs uppercase tracking-wider">
            {gameState.playerCount} player{gameState.playerCount !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-lime' : 'bg-red-500'}`} />
            <span className="text-fog text-xs uppercase tracking-wider">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate/30 px-6 flex gap-0">
        {(['live', 'questions'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 font-oscar text-sm uppercase tracking-widest border-b-2 transition-colors -mb-px ${
              tab === t
                ? 'border-lime text-lime'
                : 'border-transparent text-fog hover:text-mist'
            }`}
          >
            {t === 'live' ? 'Live Quiz' : 'Questions'}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">

        {/* ── LIVE QUIZ TAB ─────────────────────────────────────────── */}
        {tab === 'live' && (
          <div className="space-y-6">

            {/* Status + Timer */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate/20 rounded-2xl p-4">
                <p className="text-fog text-xs uppercase tracking-widest mb-1">Status</p>
                <p className="text-lime font-bold text-lg uppercase">{gameState.status}</p>
              </div>
              <div className="bg-slate/20 rounded-2xl p-4">
                <p className="text-fog text-xs uppercase tracking-widest mb-1">Timer</p>
                <p className={`font-bold text-lg tabular-nums ${gameState.timer <= 10 ? 'text-red-400' : 'text-mist'}`}>
                  {gameState.timer}s
                </p>
              </div>
              <div className="bg-slate/20 rounded-2xl p-4 col-span-2">
                <p className="text-fog text-xs uppercase tracking-widest mb-1">
                  Slide {gameState.currentSlide + 1} / {gameState.questions.length}
                </p>
                <p className="text-mist text-sm truncate">{currentQ?.text || '—'}</p>
                {currentQ && (
                  <p className="text-slate text-xs uppercase tracking-widest mt-1">
                    {TYPE_LABELS[currentQ.answerType]}
                  </p>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="bg-slate/20 rounded-2xl p-4 space-y-2">
              <p className="text-fog text-xs uppercase tracking-widest mb-2">Links</p>
              {[{ label: 'Host', url: hostUrl }, { label: 'Players', url: playUrl }].map(({ label, url }) =>
                url ? (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-fog text-xs w-14 shrink-0">{label}</span>
                    <a href={url} target="_blank" rel="noreferrer" className="text-lime text-sm hover:underline break-all truncate">
                      {url}
                    </a>
                  </div>
                ) : null
              )}
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <p className="text-fog text-xs uppercase tracking-widest">Controls</p>
              <div className="flex flex-wrap gap-2">
                <Btn variant="lime" onClick={() => sk().emit('admin:start')} disabled={gameState.status !== 'waiting'}>
                  Start Game
                </Btn>
                <Btn variant="lime" onClick={() => sk().emit('admin:next-slide')} disabled={gameState.status !== 'revealing' && gameState.status !== 'question'}>
                  Next →
                </Btn>
                <Btn onClick={() => sk().emit('admin:reveal')} disabled={gameState.status !== 'question'}>
                  Reveal Now
                </Btn>
                <Btn onClick={() => sk().emit('admin:restart-timer')} disabled={gameState.status !== 'question' && gameState.status !== 'revealing'}>
                  Reset Timer
                </Btn>
                <Btn onClick={() => sk().emit('admin:demo-mode')} disabled={gameState.status !== 'question'}>
                  Demo 🎭
                </Btn>
                <Btn variant="danger" onClick={() => { if (confirm('Reset entire game?')) sk().emit('admin:reset'); }}>
                  Reset All
                </Btn>
              </div>
            </div>

            {/* Vote tallies — question-type aware */}
            {currentQ?.answerType === 'monsters' && (
              <div className="space-y-3">
                <p className="text-fog text-xs uppercase tracking-widest">
                  Round votes — {totalVotes} total
                </p>
                {GAME_CONFIG.monsters.map((m) => {
                  const v   = currentVotes[m.id] || 0;
                  const pct = totalVotes > 0 ? (v / totalVotes) * 100 : 0;
                  return (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                      <span className="text-mist text-sm w-16 shrink-0">
                        {m.name}{gameState.roundWinner === m.id ? ' 🏆' : ''}
                      </span>
                      <div className="flex-1 bg-slate/20 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                      </div>
                      <span className="text-fog text-sm w-6 text-right tabular-nums">{v}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQ?.answerType === 'mcq' && currentQ.options && (
              <div className="space-y-3">
                <p className="text-fog text-xs uppercase tracking-widest">
                  Round votes — {totalVotes} total
                </p>
                {currentQ.options.map((opt, i) => {
                  const v   = currentVotes[String(i)] || 0;
                  const pct = totalVotes > 0 ? (v / totalVotes) * 100 : 0;
                  const isWinner = gameState.roundWinner === String(i);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`text-sm w-40 shrink-0 truncate ${isWinner ? 'text-lime font-bold' : 'text-mist'}`}>
                        {opt || `Option ${i + 1}`}{isWinner ? ' ✓' : ''}
                      </span>
                      <div className="flex-1 bg-slate/20 rounded-full h-2">
                        <div className="h-2 rounded-full bg-lime transition-all duration-300" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-fog text-sm w-6 text-right tabular-nums">{v}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQ?.answerType === 'slider' && (
              <div className="space-y-2">
                <p className="text-fog text-xs uppercase tracking-widest">
                  Slider responses — {gameState.sliderPositions[gameState.currentSlide]?.length ?? 0} submitted
                </p>
                <p className="text-slate text-xs">Distribution visible on the Host screen.</p>
              </div>
            )}

          </div>
        )}

        {/* ── QUESTIONS TAB ─────────────────────────────────────────── */}
        {tab === 'questions' && (
          <div className="space-y-4">
            {gameState.status !== 'waiting' && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2">
                <p className="text-yellow-400 text-xs font-oscar uppercase tracking-wider">
                  Game in progress — changes apply to upcoming questions only.
                </p>
              </div>
            )}

            {editedQuestions.map((q, i) => (
              <QuestionEditor
                key={q.id}
                question={q}
                index={i}
                total={editedQuestions.length}
                onChange={(updated) => updateQ(i, updated)}
                onDelete={() => deleteQ(i)}
                onMoveUp={() => moveQ(i, -1)}
                onMoveDown={() => moveQ(i, 1)}
              />
            ))}

            <button
              onClick={addQuestion}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate/40 text-fog hover:text-mist hover:border-slate/70 font-oscar text-sm uppercase tracking-widest transition-colors"
            >
              + Add Question
            </button>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => saveNow()}
                className="flex-1 py-3 rounded-2xl bg-slate/40 text-mist hover:bg-slate/60 font-oscar text-sm uppercase tracking-widest transition-colors active:scale-95"
              >
                {savedAt ? 'Saved ✓' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  saveNow();
                  setTimeout(() => {
                    if (confirm('Save questions and restart the game?')) {
                      getSocket().emit('admin:reset');
                    }
                  }, 50);
                }}
                className="flex-1 py-3 rounded-2xl bg-lime text-ink hover:bg-lime/80 font-oscar text-sm uppercase tracking-widest transition-colors active:scale-95"
              >
                Update & Restart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
