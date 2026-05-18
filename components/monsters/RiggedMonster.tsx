'use client';

import { useEffect, useRef } from 'react';
import { RIGS } from './rigs';

interface RiggedMonsterProps {
  id: string;
  name?: string;
  growthLevel?: number;
  wiggleTrigger?: number;
  isWinner?: boolean;
  voteCount?: number;
  showVoteCount?: boolean;
  showName?: boolean;
  size?: number;
}

export default function RiggedMonster({
  id,
  name = '',
  growthLevel = 1,
  wiggleTrigger = 0,
  isWinner = false,
  voteCount = 0,
  showVoteCount = false,
  showName = false,
  size = 200,
}: RiggedMonsterProps) {
  const config = RIGS[id];
  const svgRef = useRef<SVGSVGElement>(null);
  const aliveRef = useRef(true);
  const triggerVoteRef = useRef<() => void>(() => {});
  const triggerGrowRef = useRef<(target: number) => void>(() => {});
  const syncScaleRef = useRef<(target: number) => void>(() => {});
  const prevWiggle = useRef(wiggleTrigger);
  const prevGrowth = useRef(growthLevel);
  const prevIsWinner = useRef(isWinner);

  // Start the rig for this monster type
  useEffect(() => {
    if (!config) return;
    const svg = svgRef.current;
    if (!svg) return;

    aliveRef.current = true;

    const result = config.createRig(svg, id, growthLevel, aliveRef);
    if (!result) return;

    triggerVoteRef.current = result.handle.triggerVote;
    triggerGrowRef.current = result.handle.triggerGrow;
    syncScaleRef.current = result.handle.syncScale;

    return () => {
      aliveRef.current = false;
      result.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // id and config are stable; growthLevel captured at mount

  // Vote wiggle
  useEffect(() => {
    if (wiggleTrigger > prevWiggle.current) {
      prevWiggle.current = wiggleTrigger;
      triggerVoteRef.current();
    }
  }, [wiggleTrigger]);

  // Growth and reveal
  useEffect(() => {
    const growthChanged = growthLevel !== prevGrowth.current;
    const justWon = isWinner && !prevIsWinner.current;
    prevGrowth.current = growthLevel;
    prevIsWinner.current = isWinner;

    if (growthChanged) {
      if (justWon) {
        triggerGrowRef.current(growthLevel);
      } else {
        syncScaleRef.current(growthLevel);
      }
    }
  }, [growthLevel, isWinner]);

  if (!config) return null;

  return (
    <div className="relative flex flex-col items-center select-none">
      <div style={{ width: size, height: size, position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={config.viewBox}
          width={size}
          height={size}
          style={{ overflow: 'visible' }}
        >
          {config.renderSVG(id)}
        </svg>
      </div>

      {showName && (
        <div className="mt-1 text-mist font-oscar tracking-widest uppercase text-sm font-semibold">
          {name}
        </div>
      )}

      {showVoteCount && (
        <div className="mt-1 text-lime font-oscar text-lg font-bold tabular-nums">
          {voteCount}
        </div>
      )}
    </div>
  );
}
