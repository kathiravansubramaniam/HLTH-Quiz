'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '@/lib/socket';
import { GAME_CONFIG } from '@/config/game';
import type { GameState } from '@/lib/types';
import BlobMonster from '@/components/monsters/BlobMonster';
import RiggedMonster from '@/components/monsters/RiggedMonster';
import { RIGS } from '@/components/monsters/rigs';
import GooglyEyes from '@/components/GooglyEyes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'monster-quiz-player-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

const votedKey   = (slide: number) => `monster-quiz-voted-${slide}`;
const sliderKey  = (slide: number) => `monster-quiz-slider-${slide}`;

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

// ─── Slider component ─────────────────────────────────────────────────────────

function GooglySlider({
  leftLabel,
  rightLabel,
  disabled,
  initialValue,
  onConfirm,
}: {
  leftLabel: string;
  rightLabel: string;
  disabled: boolean;
  initialValue: number | null;
  onConfirm: (value: number) => void;
}) {
  const [value,     setValue]     = useState<number>(initialValue ?? 0.5);
  const [confirmed, setConfirmed] = useState(initialValue !== null);
  const [dragging,  setDragging]  = useState(false);
  const [pupilX,    setPupilX]    = useState(0);
  const trackRef  = useRef<HTMLDivElement>(null);
  const lastX     = useRef<number | null>(null);

  const getValueFromClient = (clientX: number): number => {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled && confirmed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    lastX.current = e.clientX;
    setValue(getValueFromClient(e.clientX));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const newVal = getValueFromClient(e.clientX);
    if (lastX.current !== null) {
      const delta = e.clientX - lastX.current;
      setPupilX(Math.sign(delta) * Math.min(Math.abs(delta) * 0.5, 5));
    }
    lastX.current = e.clientX;
    setValue(newVal);
  };

  const onPointerUp = () => {
    setDragging(false);
    setPupilX(0);
    lastX.current = null;
  };

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm(value);
  };

  const handleChange = () => {
    setConfirmed(false);
  };

  return (
    <div className="w-full space-y-6 px-1">
      {/* Labels */}
      <div className="flex justify-between text-xs font-oscar uppercase tracking-widest text-fog">
        <span>{leftLabel || 'Left'}</span>
        <span>{rightLabel || 'Right'}</span>
      </div>

      {/* Track + handle */}
      <div className="relative">
        {/* Track */}
        <div
          ref={trackRef}
          className="w-full h-3 bg-slate/40 rounded-full cursor-pointer relative"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Fill */}
          <div
            className="absolute left-0 top-0 h-full bg-lime/40 rounded-full pointer-events-none"
            style={{ width: `${value * 100}%` }}
          />
        </div>

        {/* Handle — googly eyes */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing transition-opacity select-none touch-none ${confirmed ? 'opacity-100' : ''}`}
          style={{ left: `${value * 100}%` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Drop shadow ring when confirmed */}
          {confirmed && (
            <div className="absolute inset-0 -m-1 rounded-full bg-lime/20 pointer-events-none" />
          )}
          <GooglyEyes
            eyeR={14}
            pupilR={5}
            pupilOffset={[pupilX, dragging ? 1 : 0]}
            blinkDelay={0.2}
          />
        </div>
      </div>

      {/* Position hint */}
      <p className="text-center text-fog text-xs font-oscar uppercase tracking-widest">
        {Math.round(value * 100)}% · {leftLabel || 'left'} ↔ {rightLabel || 'right'}
      </p>

      {/* Confirm / change button */}
      {confirmed ? (
        <button
          onClick={handleChange}
          className="w-full py-3 rounded-2xl bg-slate/30 text-fog font-oscar text-sm uppercase tracking-widest hover:bg-slate/50 transition-colors"
        >
          Submitted ✓ · Tap to change
        </button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl bg-lime text-ink font-oscar font-bold text-base uppercase tracking-widest shadow-lg"
        >
          Confirm
        </motion.button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlayerPage() {
  const [gameState,      setGameState]      = useState<GameState>(INITIAL_STATE);
  const [playerId,       setPlayerId]       = useState('');
  const [selectedMonster, setSelectedMonster] = useState<string | null>(null);
  const [selectedOption,  setSelectedOption]  = useState<number | null>(null);
  const [sliderValue,     setSliderValue]     = useState<number | null>(null);
  const [isConnected,    setIsConnected]    = useState(false);
  const [isReady,        setIsReady]        = useState(false);
  const [wiggleTriggers, setWiggleTriggers] = useState<Record<string, number>>(
    Object.fromEntries(GAME_CONFIG.monsters.map((m) => [m.id, 0]))
  );

  useEffect(() => {
    const id = getOrCreatePlayerId();
    setPlayerId(id);
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
      setIsReady(true);
      setSelectedMonster(localStorage.getItem(votedKey(merged.currentSlide)) ?? null);
      const sv = localStorage.getItem(sliderKey(merged.currentSlide));
      setSliderValue(sv !== null ? parseFloat(sv) : null);
      const so = localStorage.getItem(`monster-quiz-mcq-${merged.currentSlide}`);
      setSelectedOption(so !== null ? parseInt(so) : null);
    });

    socket.on('state:vote-update', ({ votes, monsterSizes }) =>
      setGameState((prev) => ({ ...prev, votes, monsterSizes }))
    );
    socket.on('state:timer-tick', ({ timer }) =>
      setGameState((prev) => ({ ...prev, timer }))
    );
    socket.on('state:reveal', ({ winner, monsterSizes }) =>
      setGameState((prev) => ({ ...prev, status: 'revealing', roundWinner: winner, monsterSizes }))
    );
    socket.on('state:player-count', (count) =>
      setGameState((prev) => ({ ...prev, playerCount: count }))
    );
    socket.on('state:questions-updated', (questions) =>
      setGameState((prev) => ({ ...prev, questions }))
    );
    socket.on('state:monster-wiggle', ({ monsterId }) =>
      setWiggleTriggers((prev) => ({ ...prev, [monsterId]: (prev[monsterId] || 0) + 1 }))
    );

    socket.emit('client:register', { type: 'player', playerId: id });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('state:full');
      socket.off('state:vote-update');
      socket.off('state:timer-tick');
      socket.off('state:reveal');
      socket.off('state:player-count');
      socket.off('state:questions-updated');
      socket.off('state:monster-wiggle');
    };
  }, []);

  // Restore per-slide answers when slide changes
  useEffect(() => {
    const slide = gameState.currentSlide;
    setSelectedMonster(localStorage.getItem(votedKey(slide)) ?? null);
    const sv = localStorage.getItem(sliderKey(slide));
    setSliderValue(sv !== null ? parseFloat(sv) : null);
    const so = localStorage.getItem(`monster-quiz-mcq-${slide}`);
    setSelectedOption(so !== null ? parseInt(so) : null);
  }, [gameState.currentSlide]);

  const handleMonsterVote = useCallback(
    (monsterId: string) => {
      if (gameState.status !== 'question' || !playerId) return;
      if (monsterId === selectedMonster) return;
      getSocket().emit('player:vote', { monsterId, playerId });
      setSelectedMonster(monsterId);
      localStorage.setItem(votedKey(gameState.currentSlide), monsterId);
    },
    [selectedMonster, gameState.status, gameState.currentSlide, playerId]
  );

  const handleMCQVote = useCallback(
    (optionIndex: number) => {
      if (gameState.status !== 'question' || !playerId) return;
      if (optionIndex === selectedOption) return;
      getSocket().emit('player:mcq', { optionIndex, playerId });
      setSelectedOption(optionIndex);
      localStorage.setItem(`monster-quiz-mcq-${gameState.currentSlide}`, String(optionIndex));
    },
    [selectedOption, gameState.status, gameState.currentSlide, playerId]
  );

  const handleSliderConfirm = useCallback(
    (value: number) => {
      if (!playerId) return;
      getSocket().emit('player:slider', { value, playerId });
      setSliderValue(value);
      localStorage.setItem(sliderKey(gameState.currentSlide), String(value));
    },
    [gameState.currentSlide, playerId]
  );

  const currentQuestion = gameState.questions?.[gameState.currentSlide] ?? GAME_CONFIG.questions[gameState.currentSlide];
  const timerUrgent     = gameState.timer <= 10 && gameState.timerRunning;

  return (
    <div className="h-screen overflow-hidden bg-ink flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
        <span className="font-oscar text-base font-bold text-lime uppercase tracking-widest">Monster Quiz</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-lime' : 'bg-fog'}`} />
          <span className="text-fog text-xs font-oscar uppercase tracking-wider">{isConnected ? 'Live' : '…'}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* LOADING */}
        {!isReady && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-lime border-t-transparent animate-spin" />
            <p className="text-fog font-oscar text-sm uppercase tracking-widest">Connecting…</p>
          </motion.div>
        )}

        {/* WAITING */}
        {isReady && gameState.status === 'waiting' && (
          <motion.div key="waiting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            <div className="text-5xl">👾</div>
            <h2 className="font-oscar text-2xl font-bold text-mist text-center uppercase tracking-tight">You&apos;re in!</h2>
            <p className="text-fog font-oscar text-base text-center">Waiting for the game to start…</p>
            <div className="bg-slate/20 rounded-2xl px-8 py-4 text-center">
              <span className="text-lime font-oscar text-4xl font-bold tabular-nums">{gameState.playerCount}</span>
              <p className="text-fog text-sm font-oscar mt-1 uppercase tracking-wider">
                {gameState.playerCount === 1 ? 'player' : 'players'} ready
              </p>
            </div>
          </motion.div>
        )}

        {/* QUESTION */}
        {isReady && gameState.status === 'question' && (
          <motion.div key={`question-${gameState.currentSlide}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col min-h-0">

            {/* Timer bar */}
            {gameState.timerRunning && (
              <div className="w-full bg-slate/20 h-1 shrink-0">
                <motion.div
                  className={`h-1 ${timerUrgent ? 'bg-red-400' : 'bg-lime'}`}
                  animate={{ width: `${(gameState.timer / GAME_CONFIG.timerDuration) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            )}

            {/* Question text */}
            <div className="px-5 pt-3 pb-3 shrink-0">
              <p className="text-fog text-xs font-oscar uppercase tracking-widest mb-1">
                Question {gameState.currentSlide + 1} of {gameState.questions?.length ?? 0}
              </p>
              <h2 className="font-oscar text-xl font-bold text-mist leading-tight">
                {currentQuestion?.text}
              </h2>
            </div>

            {/* ── MONSTERS ── */}
            {currentQuestion?.answerType === 'monsters' && (
              <>
                <div className="px-5 pb-1 shrink-0">
                  {selectedMonster
                    ? <p className="text-fog text-xs font-oscar uppercase tracking-widest">Voted ✓ · Tap another to change</p>
                    : <p className="text-lime text-xs font-oscar uppercase tracking-widest">Pick your monster ↓</p>
                  }
                </div>
                <div className="flex-1 grid grid-cols-3 gap-2 px-3 pb-4 pt-1 min-h-0">
                  {GAME_CONFIG.monsters.map((monster) => {
                    const isSelected = selectedMonster === monster.id;
                    return (
                      <motion.button key={monster.id} whileTap={{ scale: 0.93 }}
                        onClick={() => handleMonsterVote(monster.id)}
                        className={`relative rounded-2xl p-2 flex flex-col items-center justify-center gap-1 border-2 transition-colors overflow-hidden ${
                          isSelected ? 'bg-lime/10 border-lime' : 'bg-slate/20 border-transparent'
                        }`}>
                        {RIGS[monster.id] ? (
                          <RiggedMonster id={monster.id} growthLevel={isSelected ? 1.05 : 1}
                            wiggleTrigger={wiggleTriggers[monster.id] || 0} size={90} />
                        ) : (
                          <BlobMonster monster={monster} sizeMultiplier={isSelected ? 0.6 : 0.55}
                            wiggleTrigger={wiggleTriggers[monster.id] || 0} interactive disableIdleDrift />
                        )}
                        <span className={`font-oscar text-[10px] font-semibold uppercase tracking-wide text-center leading-tight ${isSelected ? 'text-lime' : 'text-mist'}`}>
                          {isSelected ? '✓ ' : ''}{monster.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── MCQ ── */}
            {currentQuestion?.answerType === 'mcq' && (
              <div className="flex-1 flex flex-col gap-2 px-4 pb-4 min-h-0">
                {selectedOption !== null
                  ? <p className="text-fog text-xs font-oscar uppercase tracking-widest px-1 shrink-0">Selected ✓ · Tap another to change</p>
                  : <p className="text-lime text-xs font-oscar uppercase tracking-widest px-1 shrink-0">Choose one ↓</p>
                }
                {(currentQuestion.options ?? []).map((opt, i) => {
                  const isSelected = selectedOption === i;
                  return (
                    <motion.button key={i} whileTap={{ scale: 0.97 }}
                      onClick={() => handleMCQVote(i)}
                      className={`flex-1 w-full rounded-2xl px-5 py-3 text-left font-oscar text-base font-semibold transition-colors border-2 ${
                        isSelected
                          ? 'bg-lime/10 border-lime text-lime'
                          : 'bg-slate/20 border-transparent text-mist'
                      }`}>
                      {isSelected ? '✓ ' : ''}{opt}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* ── SLIDER ── */}
            {currentQuestion?.answerType === 'slider' && (
              <div className="flex-1 flex flex-col justify-center px-6 pb-6">
                <GooglySlider
                  leftLabel={currentQuestion.leftLabel ?? 'Not at all'}
                  rightLabel={currentQuestion.rightLabel ?? 'Absolutely'}
                  disabled={gameState.status !== 'question'}
                  initialValue={sliderValue}
                  onConfirm={handleSliderConfirm}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* REVEALING */}
        {isReady && gameState.status === 'revealing' && (
          <motion.div key={`revealing-${gameState.currentSlide}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
            <div className="text-5xl">👀</div>
            <h2 className="font-oscar text-2xl font-bold text-mist text-center uppercase tracking-tight">
              Look at the main screen!
            </h2>
            <p className="text-fog font-oscar text-base text-center">Results are coming in…</p>

            {currentQuestion?.answerType === 'monsters' && selectedMonster && (() => {
              const m = GAME_CONFIG.monsters.find((x) => x.id === selectedMonster);
              if (!m) return null;
              return (
                <div className="text-center">
                  <p className="text-fog text-sm font-oscar uppercase tracking-wider">You voted for</p>
                  <p className="font-oscar text-xl font-bold mt-1" style={{ color: m.color }}>
                    {m.name} {gameState.roundWinner === m.id ? '🏆' : ''}
                  </p>
                </div>
              );
            })()}

            {currentQuestion?.answerType === 'mcq' && selectedOption !== null && (
              <div className="text-center">
                <p className="text-fog text-sm font-oscar uppercase tracking-wider">You picked</p>
                <p className={`font-oscar text-xl font-bold mt-1 ${gameState.roundWinner === String(selectedOption) ? 'text-lime' : 'text-mist'}`}>
                  {currentQuestion.options?.[selectedOption] ?? `Option ${selectedOption + 1}`}
                  {gameState.roundWinner === String(selectedOption) ? ' ✓' : ''}
                </p>
              </div>
            )}

            {currentQuestion?.answerType === 'slider' && sliderValue !== null && (
              <div className="text-center">
                <p className="text-fog text-sm font-oscar uppercase tracking-wider">You landed at</p>
                <p className="font-oscar text-xl font-bold mt-1 text-lime">{Math.round(sliderValue * 100)}%</p>
              </div>
            )}
          </motion.div>
        )}

        {/* FINAL */}
        {isReady && gameState.status === 'final' && (
          <motion.div key="final" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-between px-6 pt-4 pb-6 min-h-0">

            {/* IDEO logo — centered */}
            <div className="relative shrink-0 mx-auto" style={{ width: 162, height: 121 }}>
              <img alt="I" src="/ideo/i.svg" className="absolute" style={{ width: 45, height: 45, left: 0,   top: 0  }} />
              <img alt="D" src="/ideo/d.svg" className="absolute" style={{ width: 45, height: 45, left: 38,  top: 38 }} />
              <img alt="E" src="/ideo/e.svg" className="absolute" style={{ width: 45, height: 45, left: 76,  top: 76 }} />
              <img alt="O" src="/ideo/o.svg" className="absolute" style={{ width: 45, height: 45, left: 114, top: 38 }} />
            </div>

            {/* "Thanks for playing" label */}
            <p className="font-oscar text-xs uppercase tracking-[3px] text-fog text-center shrink-0">
              Thanks for playing
            </p>

            {/* Winner monster — centered, large */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              {gameState.overallWinner && (() => {
                const m = GAME_CONFIG.monsters.find((x) => x.id === gameState.overallWinner);
                if (!m) return null;
                return RIGS[m.id] ? (
                  <RiggedMonster id={m.id} name={m.name} growthLevel={1} showName={false} size={200} />
                ) : (
                  <BlobMonster monster={m} sizeMultiplier={1.4} showName={false} disableIdleDrift={false} />
                );
              })()}
            </div>

            {/* CTA + venue card */}
            <div className="w-full flex flex-col items-center gap-4 shrink-0">
              <p className="font-oscar text-mist text-center leading-snug" style={{ fontSize: 26 }}>
                Drop by the IDEO coffee cart at
              </p>
              <div className="w-full bg-[#1C2B38] border border-[#3a5068] rounded-2xl py-7 flex flex-col items-center gap-2">
                <span className="font-oscar font-bold text-lime leading-none" style={{ fontSize: 72 }}>D60</span>
                <span className="font-oscar" style={{ fontSize: 22, color: '#7a9ab5' }}>near the AI zone.</span>
              </div>
              <p className="text-mist font-oscar text-center leading-snug" style={{ fontSize: 18 }}>
                To see how IDEO has helped organisations like yours tackle these monsters, and get your caffeine fix,
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
