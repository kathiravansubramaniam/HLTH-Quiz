'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { getSocket } from '@/lib/socket';
import { GAME_CONFIG } from '@/config/game';
import type { GameState } from '@/lib/types';
import BlobMonster from '@/components/monsters/BlobMonster';
import RiggedMonster from '@/components/monsters/RiggedMonster';
import { RIGS } from '@/components/monsters/rigs';
import GooglyEyes from '@/components/GooglyEyes';

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

// Deterministic vertical jitter for slider dots — golden-ratio spread
function jitter(i: number): number {
  return Math.sin(i * 2.3999) * 28;
}

// ─── Slider display (host) ────────────────────────────────────────────────────

function SliderDisplay({
  positions,
  leftLabel,
  rightLabel,
}: {
  positions: number[];
  leftLabel: string;
  rightLabel: string;
}) {
  // Stable jitter offsets — only grows, never changes existing entries
  const jittersRef = useRef<number[]>([]);
  while (jittersRef.current.length < positions.length) {
    jittersRef.current.push(jitter(jittersRef.current.length));
  }

  return (
    <div className="flex-1 flex flex-col justify-center px-16 pb-8">
      {/* Labels */}
      <div className="flex justify-between mb-3 px-1">
        <span className="text-fog font-oscar text-lg uppercase tracking-widest">{leftLabel}</span>
        <span className="text-fog font-oscar text-lg uppercase tracking-widest">{rightLabel}</span>
      </div>

      {/* Track + dots */}
      <div className="relative h-24">
        {/* Track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 bg-slate/40 rounded-full" />

        {/* Googly eye dots — one per answer */}
        {positions.map((pos, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2"
            style={{
              left: `${pos * 100}%`,
              top: `calc(50% + ${jittersRef.current[i] ?? 0}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <GooglyEyes eyeR={9} pupilR={3} blinkDelay={i * 0.13} />
          </div>
        ))}
      </div>

      {/* Count */}
      <p className="text-slate text-sm font-oscar uppercase tracking-widest text-center mt-4">
        {positions.length} {positions.length === 1 ? 'response' : 'responses'}
      </p>
    </div>
  );
}

// ─── MCQ display (host) ───────────────────────────────────────────────────────

function MCQDisplay({
  options,
  votes,
  roundWinner,
}: {
  options: string[];
  votes: Record<string, number>;
  roundWinner: string | null;
}) {
  const total = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div className="flex-1 flex flex-col justify-center px-16 pb-8 gap-4">
      {options.map((opt, i) => {
        const count    = votes[String(i)] || 0;
        const pct      = total > 0 ? (count / total) * 100 : 0;
        const isWinner = roundWinner === String(i);
        return (
          <div key={i} className="flex items-center gap-4">
            <span className={`font-oscar text-base w-48 shrink-0 truncate ${isWinner ? 'text-lime font-bold' : 'text-mist'}`}>
              {opt}
              {isWinner ? ' ✓' : ''}
            </span>
            <div className="flex-1 bg-slate/30 rounded-full h-4 relative overflow-hidden">
              <motion.div
                className={`h-4 rounded-full ${isWinner ? 'bg-lime' : 'bg-slate'}`}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="text-fog font-oscar text-lg font-bold w-12 text-right tabular-nums">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HostPage() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [wiggleTriggers, setWiggleTriggers] = useState<Record<string, number>>(
    Object.fromEntries(GAME_CONFIG.monsters.map((m) => [m.id, 0]))
  );
  const [isConnected, setIsConnected] = useState(false);
  const [appUrl, setAppUrl] = useState('');
  const [mcqMonsterId, setMcqMonsterId] = useState<string>(
    () => GAME_CONFIG.monsters[Math.floor(Math.random() * GAME_CONFIG.monsters.length)].id
  );

  useEffect(() => {
    const url = window.location.origin;
    setAppUrl(url);
    const socket = getSocket();

    socket.on('connect',    () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('state:full', (state) =>
      setGameState({
        ...INITIAL_STATE,
        ...state,
        questions:       state.questions       ?? INITIAL_STATE.questions,
        sliderPositions: state.sliderPositions ?? INITIAL_STATE.sliderPositions,
      })
    );

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
    socket.on('state:monster-wiggle', ({ monsterId }) =>
      setWiggleTriggers((prev) => ({ ...prev, [monsterId]: (prev[monsterId] || 0) + 1 }))
    );
    socket.on('state:slider-update', ({ questionIndex, positions }) =>
      setGameState((prev) => {
        const sp = [...(prev.sliderPositions ?? INITIAL_STATE.sliderPositions)];
        sp[questionIndex] = positions;
        return { ...prev, sliderPositions: sp };
      })
    );
    socket.on('state:questions-updated', (questions) =>
      setGameState((prev) => ({ ...prev, questions }))
    );

    socket.emit('client:register', { type: 'host' });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('state:full');
      socket.off('state:vote-update');
      socket.off('state:timer-tick');
      socket.off('state:reveal');
      socket.off('state:player-count');
      socket.off('state:monster-wiggle');
      socket.off('state:slider-update');
      socket.off('state:questions-updated');
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const socket = getSocket();
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (gameState.status === 'waiting')   socket.emit('admin:start');
        else if (gameState.status === 'revealing') socket.emit('admin:next-slide');
      }
      if (e.key === 'r' || e.key === 'R') {
        if (gameState.status === 'question') socket.emit('admin:reveal');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState.status]);

  useEffect(() => {
    setMcqMonsterId(
      GAME_CONFIG.monsters[Math.floor(Math.random() * GAME_CONFIG.monsters.length)].id
    );
  }, [gameState.currentSlide]);

  const playUrl = appUrl && gameState.sessionId ? `${appUrl}/play/${gameState.sessionId}` : '';

  const currentQuestion = gameState.questions?.[gameState.currentSlide] ?? GAME_CONFIG.questions[gameState.currentSlide];
  const currentVotes    = gameState.votes[gameState.currentSlide] || {};
  const totalVotes      = Object.values(currentVotes).reduce((a, b) => a + b, 0);
  const currentSliderPositions = gameState.sliderPositions?.[gameState.currentSlide] ?? [];

  const timerColor = gameState.timer > 20 ? 'text-lime' : gameState.timer > 10 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div
      className="relative w-screen h-screen bg-ink overflow-hidden flex flex-col"
      style={{ minWidth: 1280, minHeight: 720 }}
    >
      {/* Connection status — always visible, top-right */}
      <div className="absolute top-3 right-4 z-50 flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-lime' : 'bg-red-500'}`} />
        <span className="text-fog text-xs font-oscar uppercase tracking-wider">
          {isConnected ? 'Live' : 'Connecting…'}
        </span>
      </div>


      <AnimatePresence mode="wait">
        {/* WAITING */}
        {gameState.status === 'waiting' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col">

            {/* Centered content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <h1 className="font-oscar text-[72px] font-bold text-mist uppercase tracking-[-1.8px] leading-none">
                Monster Quiz
              </h1>
              <p className="text-fog text-[20px] tracking-[2px] uppercase">
                Scan to join the fun
              </p>
              {playUrl && (
                <div className="bg-white p-5 rounded-2xl shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
                  <QRCodeSVG value={playUrl} size={300} bgColor="#ffffff" fgColor="#151F27" level="M" />
                </div>
              )}
              <p className="text-lime font-semibold text-[18px] tracking-[1.8px]">
                {playUrl ? playUrl.replace('https://', '').replace('http://', '') : ''}
              </p>
              <div className="flex items-center gap-3 bg-slate/30 px-6 py-3 rounded-full">
                <span className="text-lime font-bold text-[30px] tabular-nums">{gameState.playerCount}</span>
                <span className="text-fog text-[18px] uppercase tracking-[0.9px]">
                  {gameState.playerCount === 1 ? 'player' : 'players'} joined
                </span>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="relative flex items-center justify-between pl-[72px] pr-9 py-9 w-full shrink-0">
              <span className="text-[#536575] text-[24px] tracking-[-1px] uppercase">
                {gameState.playerCount} players
              </span>
              <div className="absolute left-1/2 -translate-x-1/2 bg-lime text-ink px-[45px] py-[17px] rounded-full font-bold text-[25px] tracking-[2.5px] uppercase whitespace-nowrap">
                Press Space to Start
              </div>
              {/* IDEO logo */}
              <div className="relative shrink-0" style={{ width: 150, height: 113 }}>
                <img alt="I" src="/ideo/i.svg" className="absolute" style={{ width: 39, height: 39, left: 0, top: 0 }} />
                <img alt="D" src="/ideo/d.svg" className="absolute" style={{ width: 39, height: 39, left: 37, top: 37 }} />
                <img alt="E" src="/ideo/e.svg" className="absolute" style={{ width: 39, height: 39, left: 74, top: 74 }} />
                <img alt="O" src="/ideo/o.svg" className="absolute" style={{ width: 39, height: 39, left: 111, top: 37 }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* QUESTION + REVEALING */}
        {(gameState.status === 'question' || gameState.status === 'revealing') && (
          <motion.div key={`question-${gameState.currentSlide}`}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}
            className="relative flex-1 flex flex-col">


            {currentQuestion?.answerType === 'mcq' ? (

              /* ── MCQ layout ── */
              <div className="flex-1 flex flex-col min-h-0">

                {/* TOP: question label + [question text | timer LEFT · QR RIGHT] */}
                <div className="pl-6 pr-6 pt-6 shrink-0">
                  <p className="text-slate font-oscar uppercase tracking-widest text-xs mb-3">
                    Question {gameState.currentSlide + 1} / {gameState.questions?.length ?? 0}
                  </p>
                  <div className="flex items-start justify-between gap-6">
                    <h2 className="font-oscar font-bold text-mist leading-[1.1] shrink-0" style={{ fontSize: 64, maxWidth: '60%' }}>
                      {currentQuestion?.text}
                    </h2>
                    {/* Timer on left, QR on right */}
                    <div className="flex items-start gap-3 shrink-0">
                      <div className="flex flex-col items-center">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-lime mb-0.5" fill="none" stroke="currentColor" strokeWidth={2}>
                          <circle cx={12} cy={12} r={10} />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className={`font-oscar font-bold tabular-nums leading-none ${timerColor}`} style={{ fontSize: 96 }}>
                          {gameState.timer}
                        </span>
                      </div>
                      {playUrl && (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="bg-white p-3 rounded-xl shadow-xl">
                            <QRCodeSVG value={playUrl} size={140} bgColor="#ffffff" fgColor="#151F27" level="M" />
                          </div>
                          <span className="text-fog text-xs font-oscar uppercase tracking-widest">Scan to join</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CONTENT: Options (2/3) | Monster (1/3) */}
                <div className="flex-1 flex min-h-0">
                  <div className="flex flex-col justify-center pl-6 pr-8 min-h-0" style={{ width: '66.67%' }}>
                    <div className="flex flex-col gap-[24px]">
                      {(currentQuestion.options ?? []).map((opt, i) => {
                        const count    = currentVotes[String(i)] || 0;
                        const pct      = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                        const isWinner = gameState.status === 'revealing' && gameState.roundWinner === String(i);
                        return (
                          <div key={i} className="flex items-center gap-5">
                            <span className={`font-oscar text-[22px] w-52 shrink-0 ${isWinner ? 'text-lime font-bold' : 'text-mist'}`}>
                              {opt}{isWinner ? ' ✓' : ''}
                            </span>
                            <div className="flex-1 bg-slate/30 rounded-full h-[10px] overflow-hidden">
                              <motion.div
                                className={`h-[10px] rounded-full ${isWinner ? 'bg-lime' : 'bg-slate/60'}`}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.4 }}
                              />
                            </div>
                            <span className="text-mist font-oscar text-xl w-8 text-right tabular-nums">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center overflow-hidden">
                    {RIGS[mcqMonsterId] ? (
                      <RiggedMonster id={mcqMonsterId} name="" growthLevel={1} wiggleTrigger={0}
                        isWinner={false} voteCount={0} showVoteCount={false} showName={false} size={540} />
                    ) : (
                      <BlobMonster
                        monster={GAME_CONFIG.monsters.find((m) => m.id === mcqMonsterId)!}
                        sizeMultiplier={2.8} wiggleTrigger={0} isWinner={false}
                        voteCount={0} showVoteCount={false} showName={false} disableIdleDrift={false} />
                    )}
                  </div>
                </div>
              </div>

            ) : (

              /* ── Monsters / Slider layout ── */
              <>
                {/* TOP: same layout as MCQ */}
                <div className="pl-6 pr-6 pt-6 shrink-0">
                  <p className="text-slate font-oscar uppercase tracking-widest text-xs mb-3">
                    Question {gameState.currentSlide + 1} / {gameState.questions?.length ?? 0}
                  </p>
                  <div className="flex items-start justify-between gap-6">
                    <h2 className="font-oscar font-bold text-mist leading-[1.1] shrink-0" style={{ fontSize: 64, maxWidth: '60%' }}>
                      {currentQuestion?.text}
                    </h2>
                    <div className="flex items-start gap-3 shrink-0">
                      <div className="flex flex-col items-center">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-lime mb-0.5" fill="none" stroke="currentColor" strokeWidth={2}>
                          <circle cx={12} cy={12} r={10} />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className={`font-oscar font-bold tabular-nums leading-none ${timerColor}`} style={{ fontSize: 96 }}>
                          {gameState.timer}
                        </span>
                      </div>
                      {playUrl && (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="bg-white p-3 rounded-xl shadow-xl">
                            <QRCodeSVG value={playUrl} size={140} bgColor="#ffffff" fgColor="#151F27" level="M" />
                          </div>
                          <span className="text-fog text-xs font-oscar uppercase tracking-widest">Scan to join</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── MONSTERS ── */}
                {currentQuestion?.answerType === 'monsters' && (
                  <div className="flex-1 flex items-end justify-around px-8 pb-4">
                    {GAME_CONFIG.monsters.map((monster) => {
                      const votes    = currentVotes[monster.id] || 0;
                      const isWinner = gameState.status === 'revealing' && gameState.roundWinner === monster.id;
                      return (
                        <div key={monster.id} className="flex flex-col items-center gap-3">
                          {RIGS[monster.id] ? (
                            <RiggedMonster id={monster.id} name={monster.name}
                              growthLevel={gameState.monsterSizes[monster.id] || 1}
                              wiggleTrigger={wiggleTriggers[monster.id] || 0}
                              isWinner={isWinner} voteCount={votes} showVoteCount showName />
                          ) : (
                            <BlobMonster monster={monster} sizeMultiplier={gameState.monsterSizes[monster.id] || 1}
                              wiggleTrigger={wiggleTriggers[monster.id] || 0}
                              isWinner={isWinner} voteCount={votes} showVoteCount showName />
                          )}
                          <div className="w-full bg-slate/30 rounded-full h-2 max-w-[120px]">
                            <motion.div className="bg-lime h-2 rounded-full"
                              animate={{ width: totalVotes > 0 ? `${(votes / totalVotes) * 100}%` : '0%' }}
                              transition={{ duration: 0.3 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── SLIDER ── */}
                {currentQuestion?.answerType === 'slider' && (
                  <SliderDisplay
                    positions={currentSliderPositions}
                    leftLabel={currentQuestion.leftLabel ?? 'Not at all'}
                    rightLabel={currentQuestion.rightLabel ?? 'Absolutely'}
                  />
                )}
              </>
            )}

            {/* ── SHARED BOTTOM BAR — all question types ── */}
            <div className="relative flex items-center justify-between pl-6 pr-9 py-6 w-full shrink-0">
              <AnimatePresence>
                {gameState.status === 'revealing' && (
                  <motion.div key="reveal-pill"
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                    <div className="bg-lime text-ink rounded-full px-[45px] py-[17px] font-oscar font-bold text-[25px] tracking-[2.5px] uppercase whitespace-nowrap">
                      Next question in {gameState.timer}s
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="text-[#536575] text-[18px] uppercase tracking-[-0.5px]">
                {currentQuestion?.answerType === 'slider'
                  ? `${currentSliderPositions.length} ${currentSliderPositions.length === 1 ? 'response' : 'responses'} · ${gameState.playerCount} ${gameState.playerCount === 1 ? 'player' : 'players'}`
                  : `${totalVotes} ${totalVotes === 1 ? 'response' : 'responses'} · ${gameState.playerCount} ${gameState.playerCount === 1 ? 'player' : 'players'}`
                }
              </span>
              <div className="relative shrink-0" style={{ width: 150, height: 113 }}>
                <img alt="I" src="/ideo/i.svg" className="absolute" style={{ width: 39, height: 39, left: 0,   top: 0  }} />
                <img alt="D" src="/ideo/d.svg" className="absolute" style={{ width: 39, height: 39, left: 37,  top: 37 }} />
                <img alt="E" src="/ideo/e.svg" className="absolute" style={{ width: 39, height: 39, left: 74,  top: 74 }} />
                <img alt="O" src="/ideo/o.svg" className="absolute" style={{ width: 39, height: 39, left: 111, top: 37 }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* FINAL */}
        {gameState.status === 'final' && (
          <motion.div key="final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            className="flex-1 flex flex-col">

            {/* Top section: IDEO logo + title/body | venue card */}
            <div className="flex items-start justify-between px-12 pt-10 pb-4 shrink-0">
              {/* Left: big IDEO logo + title + body */}
              <div className="flex items-start gap-8">
                <div className="relative shrink-0" style={{ width: 252, height: 190 }}>
                  <img alt="I" src="/ideo/i.svg" className="absolute" style={{ width: 70, height: 70, left: 0,   top: 0   }} />
                  <img alt="D" src="/ideo/d.svg" className="absolute" style={{ width: 70, height: 70, left: 60,  top: 60  }} />
                  <img alt="E" src="/ideo/e.svg" className="absolute" style={{ width: 70, height: 70, left: 120, top: 120 }} />
                  <img alt="O" src="/ideo/o.svg" className="absolute" style={{ width: 70, height: 70, left: 180, top: 60  }} />
                </div>
                <div className="flex flex-col gap-3 max-w-2xl pt-2">
                  <h1 className="font-oscar font-bold text-lime leading-none" style={{ fontSize: 64 }}>
                    Thanks for Playing!
                  </h1>
                  <p className="text-mist font-oscar leading-snug" style={{ fontSize: 20 }}>
                    To see how IDEO has helped organisations like yours tackle these monsters,
                    and get your caffeine fix, drop by the IDEO coffee cart at
                  </p>
                </div>
              </div>
              {/* Right: venue card */}
              <div className="shrink-0 bg-[#1C2B38] rounded-2xl px-10 py-8 flex flex-col items-center gap-2 min-w-[220px]">
                <span className="font-oscar font-bold text-lime leading-none" style={{ fontSize: 64 }}>D60</span>
                <span className="text-fog font-oscar" style={{ fontSize: 20 }}>near the AI zone.</span>
              </div>
            </div>

            {/* Monsters row — bottom aligned, winner first and larger */}
            <div className="flex-1 flex items-end justify-around px-8 pb-4 min-h-0">
              {GAME_CONFIG.monsters
                .slice()
                .sort((a, b) => {
                  if (a.id === gameState.overallWinner) return -1;
                  if (b.id === gameState.overallWinner) return 1;
                  return (gameState.monsterSizes[b.id] || 1) - (gameState.monsterSizes[a.id] || 1);
                })
                .map((monster, rank) => {
                  const size = gameState.monsterSizes[monster.id] || 1;
                  const isChamp = monster.id === gameState.overallWinner;
                  const totalVotesForMonster = gameState.votes.reduce(
                    (acc, rv) => acc + (rv[monster.id] || 0), 0
                  );
                  const totalAllVotes = gameState.votes.reduce(
                    (acc, rv) => acc + Object.values(rv).reduce((a, b) => a + b, 0), 0
                  );
                  const pct = totalAllVotes > 0 ? (totalVotesForMonster / totalAllVotes) * 100 : 0;
                  const monsterSize = isChamp ? 260 : 160;
                  return (
                    <motion.div key={monster.id}
                      initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: rank * 0.08 + 0.3, duration: 0.5 }}
                      className="flex flex-col items-center gap-1">
                      {isChamp && (
                        <span className="font-oscar italic text-mist text-2xl mb-2">Winner!</span>
                      )}
                      {RIGS[monster.id] ? (
                        <RiggedMonster id={monster.id} name={monster.name} growthLevel={size}
                          isWinner={isChamp} showName={false} showVoteCount={false}
                          voteCount={totalVotesForMonster} size={monsterSize} />
                      ) : (
                        <BlobMonster monster={monster} sizeMultiplier={isChamp ? size : 1}
                          isWinner={isChamp} showName={false} showVoteCount={false}
                          voteCount={totalVotesForMonster} disableIdleDrift={false} />
                      )}
                      <span className="text-mist font-oscar text-xs uppercase tracking-widest text-center leading-tight mt-2" style={{ maxWidth: 130 }}>
                        {monster.name}
                      </span>
                      <span className="text-lime font-oscar text-sm font-bold tabular-nums">{totalVotesForMonster}</span>
                      <div className="bg-slate/30 rounded-full overflow-hidden" style={{ width: 120, height: 4 }}>
                        <motion.div className="bg-lime h-full rounded-full"
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: rank * 0.08 + 0.5 }} />
                      </div>
                    </motion.div>
                  );
                })}
            </div>

            {/* Same footer as question screens */}
            <div className="relative flex items-center justify-between pl-6 pr-9 py-6 w-full shrink-0">
              <span className="text-[#536575] text-[18px] uppercase tracking-[-0.5px]">
                {gameState.votes.reduce((acc, rv) => acc + Object.values(rv).reduce((a, b) => a + b, 0), 0)} responses · {gameState.playerCount} {gameState.playerCount === 1 ? 'player' : 'players'}
              </span>
              <div className="relative shrink-0" style={{ width: 150, height: 113 }}>
                <img alt="I" src="/ideo/i.svg" className="absolute" style={{ width: 39, height: 39, left: 0,   top: 0  }} />
                <img alt="D" src="/ideo/d.svg" className="absolute" style={{ width: 39, height: 39, left: 37,  top: 37 }} />
                <img alt="E" src="/ideo/e.svg" className="absolute" style={{ width: 39, height: 39, left: 74,  top: 74 }} />
                <img alt="O" src="/ideo/o.svg" className="absolute" style={{ width: 39, height: 39, left: 111, top: 37 }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
