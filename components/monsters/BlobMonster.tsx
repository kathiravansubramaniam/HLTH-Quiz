'use client';

import { useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  useAnimationControls,
  animate,
} from 'framer-motion';
import type { MonsterConfig } from '@/lib/types';

interface BlobMonsterProps {
  monster: MonsterConfig;
  sizeMultiplier?: number;
  wiggleTrigger?: number;
  isWinner?: boolean;
  voteCount?: number;
  showVoteCount?: boolean;
  showName?: boolean;
  interactive?: boolean;
  selected?: boolean;
  onTap?: () => void;
  className?: string;
  disableIdleDrift?: boolean;
}

// EyeGroup: eye white (motion.ellipse ry-blink), pupil (SVG cx/cy springs), highlight
// Using ry animation avoids all CSS transform-origin issues in SVG.
// Pupil uses SVG coordinate motion values instead of CSS x/y transforms.
function EyeGroup({
  cx,
  cy,
  eyeRadius,
  pupilRadius,
  blobVx,
  blobVy,
  clipId,
}: {
  cx: number;
  cy: number;
  eyeRadius: number;
  pupilRadius: number;
  blobVx: import('framer-motion').MotionValue<number>;
  blobVy: import('framer-motion').MotionValue<number>;
  clipId: string;
}) {
  const maxOffset = eyeRadius - pupilRadius - 1;

  // Blink — animate ry to near-zero, no transform-origin needed
  const eyeRy = useMotionValue(eyeRadius);

  // Pupil in absolute SVG coordinates so springs work in the SVG space
  const targetPupilX = useMotionValue(cx);
  const targetPupilY = useMotionValue(cy + maxOffset * 0.35); // gravity droop
  const springPupilX = useSpring(targetPupilX, { stiffness: 32, damping: 9 });
  const springPupilY = useSpring(targetPupilY, { stiffness: 32, damping: 9 });

  // Stable random delay — computed once, never changes across re-renders
  const blinkDelay = useRef(800 + Math.random() * 2200).current;
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;

    // Pupil random walk
    const movePupil = () => {
      if (!alive.current) return;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * maxOffset * 0.88;
      let dx = Math.cos(angle) * dist;
      let dy = Math.sin(angle) * dist + maxOffset * 0.28;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > maxOffset) { dx = (dx / len) * maxOffset; dy = (dy / len) * maxOffset; }
      targetPupilX.set(cx + dx);
      targetPupilY.set(cy + dy);
      setTimeout(movePupil, 700 + Math.random() * 1800);
    };
    setTimeout(movePupil, Math.random() * 900);

    // Loose velocity following
    const unsubX = blobVx.on('change', (v) => {
      if (Math.abs(v) > 45) {
        const off = Math.sign(v) * Math.min(Math.abs(v * 0.055), maxOffset * 0.8);
        targetPupilX.set(cx + off);
      }
    });
    const unsubY = blobVy.on('change', (v) => {
      if (Math.abs(v) > 45) {
        const off = Math.sign(v) * Math.min(Math.abs(v * 0.055), maxOffset * 0.6);
        targetPupilY.set(cy + off + maxOffset * 0.28);
      }
    });

    // Blink scheduling — runs once on mount, stable loop
    const doBlink = async () => {
      if (!alive.current) return;
      await animate(eyeRy, 0.4, { duration: 0.06 });
      if (!alive.current) return;
      await animate(eyeRy, eyeRadius, { duration: 0.08 });
    };
    const scheduleBlink = () => {
      setTimeout(async () => {
        if (!alive.current) return;
        await doBlink();
        if (Math.random() < 0.25 && alive.current) {
          await new Promise((r) => setTimeout(r, 140));
          await doBlink();
        }
        if (alive.current) scheduleBlink();
      }, 3200 + Math.random() * 5000);
    };
    setTimeout(scheduleBlink, blinkDelay);

    return () => {
      alive.current = false;
      unsubX();
      unsubY();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — all values captured at mount are stable

  return (
    <>
      <defs>
        {/* Clip path shrinks vertically for blink — drives both white and pupil */}
        <clipPath id={clipId}>
          <motion.ellipse
            cx={cx as unknown as number}
            cy={cy as unknown as number}
            rx={eyeRadius as unknown as number}
            ry={eyeRy as unknown as number}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx={cx} cy={cy} r={eyeRadius} fill="white" />
        <motion.circle
          cx={springPupilX as unknown as number}
          cy={springPupilY as unknown as number}
          r={pupilRadius}
          fill="#1a1a1a"
        />
        <circle
          cx={cx - eyeRadius * 0.28}
          cy={cy - eyeRadius * 0.28}
          r={eyeRadius * 0.17}
          fill="rgba(255,255,255,0.75)"
        />
      </g>
    </>
  );
}

export default function BlobMonster({
  monster,
  sizeMultiplier = 1,
  wiggleTrigger = 0,
  isWinner = false,
  voteCount = 0,
  showVoteCount = false,
  showName = false,
  interactive = false,
  selected = false,
  onTap,
  className = '',
  disableIdleDrift = false,
}: BlobMonsterProps) {
  const wiggleControls = useAnimationControls();
  const scaleControls = useAnimationControls();
  const prevWiggleTrigger = useRef(0);
  const prevSizeMultiplier = useRef(sizeMultiplier);
  const alive = useRef(true);

  // Drift motion values
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, {
    stiffness: monster.springStiffness,
    damping: 8,
    mass: 1.2,
  });
  const y = useSpring(targetY, {
    stiffness: monster.springStiffness,
    damping: 8,
    mass: 1.2,
  });

  // Velocity for squash/stretch
  const vx = useVelocity(x);
  const vy = useVelocity(y);

  const scaleX = useTransform(
    [vx, vy],
    ([vxV, vyV]: number[]) => {
      const speed = Math.sqrt(vxV * vxV + vyV * vyV);
      const stretch = Math.min(speed / 300, 1) * 0.12;
      return 1 + Math.abs(vxV) / (speed + 1) * stretch;
    }
  );

  const scaleY = useTransform(
    [vx, vy],
    ([vxV, vyV]: number[]) => {
      const speed = Math.sqrt(vxV * vxV + vyV * vyV);
      const stretch = Math.min(speed / 300, 1) * 0.12;
      return 1 + Math.abs(vyV) / (speed + 1) * stretch;
    }
  );

  // Idle drift loop
  useEffect(() => {
    if (disableIdleDrift) return;
    alive.current = true;

    const drift = () => {
      if (!alive.current) return;
      const range = monster.driftRange;
      targetX.set((Math.random() - 0.5) * range * 2);
      targetY.set((Math.random() - 0.5) * range * 2);
      const nextDelay = monster.driftSpeed * (0.7 + Math.random() * 0.6);
      setTimeout(drift, nextDelay);
    };

    // Stagger start so all blobs don't move in sync
    setTimeout(drift, Math.random() * 1500);

    return () => {
      alive.current = false;
    };
  }, [disableIdleDrift, monster.driftRange, monster.driftSpeed, targetX, targetY]);

  // Vote wiggle
  useEffect(() => {
    if (wiggleTrigger > prevWiggleTrigger.current) {
      prevWiggleTrigger.current = wiggleTrigger;
      wiggleControls.start({
        rotate: [0, -9, 11, -7, 5, -2, 0],
        transition: { duration: 0.45, ease: 'easeOut' },
      });
      // Bigger impulse to drift
      targetX.set(
        (Math.random() - 0.5) * monster.driftRange * 3
      );
      targetY.set(
        (Math.random() - 0.5) * monster.driftRange * 3
      );
    }
  }, [wiggleTrigger, wiggleControls, targetX, targetY, monster.driftRange]);

  // Grow on win / size change — always spikes dramatically before settling
  useEffect(() => {
    if (sizeMultiplier !== prevSizeMultiplier.current) {
      prevSizeMultiplier.current = sizeMultiplier;
      scaleControls.start({
        scale: [null, sizeMultiplier * 1.45, sizeMultiplier],
        transition: {
          duration: 1.6,
          times: [0, 0.38, 1],
          ease: ['easeOut', 'easeInOut'],
        },
      });
    }
  }, [sizeMultiplier, scaleControls]);

  // Set initial scale
  useEffect(() => {
    scaleControls.set({ scale: sizeMultiplier });
    prevSizeMultiplier.current = sizeMultiplier;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const baseSize = 200;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <motion.div
        animate={scaleControls}
        initial={{ scale: sizeMultiplier }}
        style={{ x, y, width: baseSize, height: baseSize }}
        className="relative"
      >
        <motion.div
          animate={wiggleControls}
          style={{ scaleX, scaleY, transformOrigin: 'center center', width: '100%', height: '100%' }}
        >
          <svg
            viewBox="0 0 200 200"
            width={baseSize}
            height={baseSize}
            className={`${interactive ? 'cursor-pointer' : ''}`}
            onClick={onTap}
          >
            {/* Drop shadow */}
            <defs>
              <filter id={`shadow-${monster.id}`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="8"
                  floodColor={monster.color}
                  floodOpacity="0.3"
                />
              </filter>
            </defs>

            {/* Blob body */}
            <path
              d={monster.blobPath}
              fill={monster.color}
              filter={`url(#shadow-${monster.id})`}
            />

            {/* Selected highlight */}
            {selected && (
              <path
                d={monster.blobPath}
                fill="none"
                stroke="#D9FF00"
                strokeWidth="4"
                opacity={0.9}
              />
            )}

            {/* Eyes */}
            <EyeGroup
              cx={monster.eyeLeft.cx}
              cy={monster.eyeLeft.cy}
              eyeRadius={monster.eyeRadius}
              pupilRadius={monster.pupilRadius}
              blobVx={vx}
              blobVy={vy}
              clipId={`ec-${monster.id}-L`}
            />
            <EyeGroup
              cx={monster.eyeRight.cx}
              cy={monster.eyeRight.cy}
              eyeRadius={monster.eyeRadius}
              pupilRadius={monster.pupilRadius}
              blobVx={vx}
              blobVy={vy}
              clipId={`ec-${monster.id}-R`}
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Winner sparkle ring */}
      {isWinner && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-full border-4 border-lime animate-ping"
            style={{ width: baseSize * sizeMultiplier * 1.1, height: baseSize * sizeMultiplier * 1.1 }}
          />
        </div>
      )}

      {/* Name */}
      {showName && (
        <div
          className="mt-1 text-mist font-oscar tracking-widest uppercase text-sm font-semibold"
          style={{ marginTop: '0.5rem' }}
        >
          {monster.name}
        </div>
      )}

      {/* Vote count */}
      {showVoteCount && (
        <div className="mt-1 text-lime font-oscar text-lg font-bold tabular-nums">
          {voteCount}
        </div>
      )}
    </div>
  );
}
