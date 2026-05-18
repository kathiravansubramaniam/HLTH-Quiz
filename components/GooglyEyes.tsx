'use client';

import { useId } from 'react';

interface GooglyEyesProps {
  eyeR?: number;
  pupilR?: number;
  /** Pupil displacement from eye center, clamped to iris boundary */
  pupilOffset?: [number, number];
  /** Animation start delay in seconds — stagger multiple instances */
  blinkDelay?: number;
  className?: string;
}

export default function GooglyEyes({
  eyeR = 11,
  pupilR = 4,
  pupilOffset = [0, 0],
  blinkDelay = 0,
  className = '',
}: GooglyEyesProps) {
  const uid = useId();
  const gap = 5;
  const pad = 2;
  const e1x = pad + eyeR;
  const e2x = e1x + eyeR * 2 + gap;
  const ey  = pad + eyeR;
  const w   = e2x + eyeR + pad;
  const h   = pad * 2 + eyeR * 2;

  // Clamp pupil so it stays inside the iris
  const maxDist = eyeR - pupilR - 1;
  const rawLen  = Math.hypot(pupilOffset[0], pupilOffset[1]) || 0.001;
  const clamp   = rawLen > maxDist ? maxDist / rawLen : 1;
  const px = pupilOffset[0] * clamp;
  const py = pupilOffset[1] * clamp;

  const clipIds = [`${uid}-c1`, `${uid}-c2`];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {[e1x, e2x].map((cx, i) => (
          <clipPath key={i} id={clipIds[i]}>
            <circle cx={cx} cy={ey} r={eyeR - 0.5} />
          </clipPath>
        ))}
      </defs>

      {[e1x, e2x].map((cx, i) => (
        <g
          key={cx}
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'center',
            animation: `eyeBlink 3.5s ${blinkDelay + i * 0.07}s infinite`,
          }}
        >
          {/* White of the eye */}
          <circle cx={cx} cy={ey} r={eyeR} fill="#F3F7FB" stroke="#2D3748" strokeWidth="1.5" />
          {/* Pupil */}
          <circle
            cx={cx + px}
            cy={ey + py}
            r={pupilR}
            fill="#181625"
            clipPath={`url(#${clipIds[i]})`}
          />
          {/* Specular highlight */}
          <circle
            cx={cx + px + pupilR * 0.32}
            cy={ey + py - pupilR * 0.35}
            r={pupilR * 0.36}
            fill="#F9FBFD"
            clipPath={`url(#${clipIds[i]})`}
          />
        </g>
      ))}
    </svg>
  );
}
