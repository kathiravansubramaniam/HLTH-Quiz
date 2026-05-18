import type { ReactNode } from 'react';
import type { RigConfig, RigHandle } from './types';

function renderSVG(id: string): ReactNode {
  return (
    <>
      <defs>
        <clipPath id={`${id}-eye-clip`}>
          <circle cx="123.4" cy="72.4" r="25.7" />
        </clipPath>
      </defs>

      <g id={`${id}-monster-root`}>
        <g id={`${id}-feet-left`}>
          <path d="M99.1691 192.69C99.1691 192.69 96.1845 216.102 96.1845 224.868C96.1845 233.634 96.1845 237.269 95.7172 238.483C95.25 239.696 86.7657 241.653 84.7155 245.289C83.9312 246.678 84.0051 248.49 84.3961 250.197C85.3043 254.176 89.3355 256.677 93.2832 255.647C93.5026 255.589 93.7219 255.525 93.946 255.454C93.946 255.454 98.7948 258.107 104.204 256.033C104.204 256.033 110.19 257.876 115.649 255.485C117.637 254.614 118.913 252.641 118.913 250.471V194.09L99.1667 192.69H99.1691Z" fill="#8CA5C8" />
          <path d="M107.426 245.172C105.922 245.987 104.878 247.396 104.234 248.95C103.509 250.702 103.366 252.641 103.302 254.517C103.285 254.998 103.738 255.461 104.224 255.439C104.739 255.415 105.128 255.034 105.147 254.517C105.207 252.8 105.328 251.232 105.946 249.611C106.012 249.432 105.905 249.684 105.993 249.496C106.031 249.413 106.07 249.332 106.108 249.248C106.182 249.098 106.258 248.95 106.341 248.805C106.425 248.659 106.511 248.519 106.604 248.378C106.654 248.302 106.706 248.23 106.758 248.154C106.873 247.987 106.716 248.197 106.835 248.054C107.064 247.775 107.309 247.515 107.583 247.279C107.607 247.258 107.803 247.1 107.676 247.198C107.748 247.143 107.822 247.091 107.896 247.041C108.046 246.941 108.201 246.848 108.358 246.762C108.797 246.526 108.935 245.92 108.689 245.501C108.43 245.057 107.867 244.931 107.428 245.169L107.426 245.172Z" fill="#43567A" />
          <path d="M97.2941 245.532C95.8661 246.135 94.7696 247.427 94.1402 248.819C93.3797 250.507 93.1795 252.336 92.9983 254.159C92.9506 254.641 93.456 255.103 93.9209 255.082C94.462 255.058 94.7934 254.677 94.8435 254.159C94.9245 253.349 94.9889 252.662 95.1271 251.904C95.1987 251.511 95.2845 251.12 95.3941 250.734C95.4537 250.524 95.5205 250.317 95.592 250.112C95.6206 250.028 95.6516 249.947 95.685 249.864C95.7017 249.821 95.7183 249.78 95.735 249.737C95.7064 249.804 95.7064 249.809 95.7326 249.749C95.8709 249.446 96.0259 249.151 96.2047 248.869C96.2929 248.729 96.3882 248.591 96.486 248.459C96.3954 248.581 96.5527 248.381 96.567 248.364C96.6147 248.307 96.6648 248.25 96.7148 248.195C96.8269 248.073 96.9413 247.956 97.0629 247.847C97.1296 247.787 97.1964 247.73 97.2655 247.67C97.3871 247.568 97.2488 247.678 97.3275 247.625C97.6112 247.43 97.9044 247.26 98.2238 247.127C98.6839 246.934 98.784 246.254 98.5552 245.866C98.2763 245.391 97.7542 245.339 97.2941 245.534V245.532Z" fill="#43567A" />
        </g>

        <g id={`${id}-feet-right`}>
          <path d="M148.92 192.69C148.92 192.69 151.904 216.102 151.904 224.868C151.904 233.634 151.904 237.269 152.372 238.483C152.839 239.694 161.323 241.653 163.373 245.289C164.158 246.678 164.084 248.49 163.693 250.197C162.784 254.176 158.753 256.677 154.805 255.647C154.586 255.589 154.367 255.525 154.143 255.454C154.143 255.454 149.294 258.107 143.885 256.033C143.885 256.033 137.899 257.876 132.44 255.485C130.452 254.614 129.176 252.641 129.176 250.471V194.09L148.922 192.69H148.92Z" fill="#8CA5C8" />
          <path d="M139.734 246.764C139.894 246.85 140.047 246.94 140.197 247.043C140.271 247.093 140.345 247.145 140.416 247.2C140.287 247.1 140.507 247.279 140.509 247.281C140.771 247.505 141.01 247.756 141.229 248.023C141.258 248.059 141.286 248.092 141.315 248.128C141.272 248.073 141.269 248.07 141.308 248.12C141.36 248.194 141.412 248.268 141.465 248.342C141.558 248.48 141.646 248.621 141.73 248.767C141.82 248.924 141.906 249.086 141.987 249.248C142.028 249.329 142.066 249.413 142.101 249.496C142.223 249.763 142.044 249.336 142.149 249.61C142.771 251.227 142.888 252.802 142.948 254.517C142.964 254.998 143.36 255.463 143.87 255.439C144.38 255.415 144.81 255.034 144.793 254.517C144.729 252.64 144.585 250.705 143.861 248.95C143.217 247.393 142.173 245.985 140.669 245.172C140.244 244.943 139.644 245.052 139.408 245.503C139.172 245.954 139.286 246.521 139.739 246.764H139.734Z" fill="#43567A" />
          <path d="M149.865 247.124C150.17 247.253 150.447 247.418 150.725 247.596C150.954 247.744 150.613 247.494 150.823 247.668C150.892 247.725 150.959 247.782 151.026 247.844C151.135 247.944 151.243 248.049 151.343 248.159C151.612 248.447 151.646 248.497 151.86 248.831C152.048 249.124 152.211 249.432 152.356 249.749C152.397 249.837 152.327 249.67 152.387 249.82C152.425 249.916 152.461 250.011 152.497 250.109C152.563 250.297 152.625 250.488 152.68 250.679C152.792 251.063 152.88 251.453 152.952 251.847C153.095 252.624 153.164 153.327 153.245 254.157C153.293 254.636 153.636 255.103 154.168 255.079C154.628 255.058 155.14 254.672 155.09 254.157C154.909 252.333 154.709 250.505 153.948 248.817C153.321 247.425 152.225 246.135 150.795 245.529C150.351 245.341 149.786 245.382 149.533 245.861C149.326 246.257 149.39 246.922 149.865 247.122V247.124Z" fill="#43567A" />
        </g>

        <g id={`${id}-tentacles`} stroke="#8CA5C8" strokeWidth="8" strokeLinecap="round" fill="none">
          <path id={`${id}-tentacle-left-1`}  d="" />
          <path id={`${id}-tentacle-left-2`}  d="" />
          <path id={`${id}-tentacle-left-3`}  d="" />
          <path id={`${id}-tentacle-right-1`} d="" />
          <path id={`${id}-tentacle-right-2`} d="" />
          <path id={`${id}-tentacle-right-3`} d="" />
        </g>

        <g id={`${id}-torso-group`}>
          <g id={`${id}-torso`}>
            <path d="M88.6638 34.8215C88.6638 34.8215 85.0378 21.8006 87.0165 20.4823C88.9951 19.164 97.2363 27.6531 97.2363 27.6531L101.027 25.4289C101.027 25.4289 100.533 8.78213 102.18 8.94662C103.828 9.11111 113.058 21.8841 113.058 21.8841H117.18C117.18 21.8841 121.628 -1.11106 124.267 0.0427445C126.904 1.19655 131.684 21.4716 131.684 21.4716L135.474 21.8006C135.474 21.8006 144.705 8.11941 146.519 9.10872C148.333 10.098 147.837 25.9224 147.837 25.9224L151.627 28.23C151.627 28.23 160.198 18.5061 162.176 20.3178C164.155 22.1296 160.198 34.8239 160.198 34.8239C160.198 34.8239 172.453 45.4799 176.074 67.2044C179.695 88.9289 188.521 136.001 185.352 159.762C182.184 183.525 167.702 212.491 120.63 210.68C73.5594 208.87 62.243 168.134 62.9224 152.972C63.6018 137.811 71.7476 71.9555 71.7476 71.9555C71.7476 71.9555 76.2985 44.2165 88.6614 34.8215H88.6638Z" fill="#8CA5C8" />
          </g>
          <g id={`${id}-texture`}>
            <path d="M73.7541 145.043C76.5505 145.043 76.5552 140.697 73.7541 140.697C70.953 140.697 70.953 145.043 73.7541 145.043Z" fill="#43567A" />
            <path d="M85.1774 150.279C87.9737 150.279 87.9785 145.933 85.1774 145.933C82.3763 145.933 82.3763 150.279 85.1774 150.279Z" fill="#43567A" />
            <path d="M77.0874 159.323C79.8838 159.323 79.8885 154.977 77.0874 154.977C74.2864 154.977 74.2864 159.323 77.0874 159.323Z" fill="#43567A" />
            <path d="M78.5146 171.7C81.3109 171.7 81.3157 167.354 78.5146 167.354C75.7135 167.354 75.7135 171.7 78.5146 171.7Z" fill="#43567A" />
            <path d="M92.3171 165.035C95.1134 165.035 95.1182 160.689 92.3171 160.689C89.516 160.689 89.516 165.035 92.3171 165.035Z" fill="#43567A" />
            <path d="M93.2693 176.935C96.0656 176.935 96.0704 172.59 93.2693 172.59C90.4682 172.59 90.4682 176.935 93.2693 176.935Z" fill="#43567A" />
            <path d="M82.3211 187.883C85.1174 187.883 85.1222 183.537 82.3211 183.537C79.52 183.537 79.52 187.883 82.3211 187.883Z" fill="#43567A" />
            <path d="M98.9818 193.119C101.778 193.119 101.783 188.773 98.9818 188.773C96.1807 188.773 96.1807 193.119 98.9818 193.119Z" fill="#43567A" />
            <path d="M108.503 182.647C111.299 182.647 111.304 178.301 108.503 178.301C105.702 178.301 105.702 182.647 108.503 182.647Z" fill="#43567A" />
            <path d="M116.593 196.45C119.389 196.45 119.394 192.104 116.593 192.104C113.792 192.104 113.792 196.45 116.593 196.45Z" fill="#43567A" />
            <path d="M126.589 198.832C129.385 198.832 129.39 194.486 126.589 194.486C123.788 194.486 123.788 198.832 126.589 198.832Z" fill="#43567A" />
            <path d="M136.11 186.932C138.906 186.932 138.911 182.586 136.11 182.586C133.309 182.586 133.309 186.932 136.11 186.932Z" fill="#43567A" />
            <path d="M116.593 178.364C119.389 178.364 119.394 174.018 116.593 174.018C113.792 174.018 113.792 178.364 116.593 178.364Z" fill="#43567A" />
            <path d="M127.066 163.13C129.862 163.13 129.867 158.784 127.066 158.784C124.265 158.784 124.265 163.13 127.066 163.13Z" fill="#43567A" />
            <path d="M135.156 172.175C137.952 172.175 137.957 167.829 135.156 167.829C132.355 167.829 132.355 172.175 135.156 172.175Z" fill="#43567A" />
            <path d="M157.529 179.791C160.325 179.791 160.33 175.445 157.529 175.445C154.728 175.445 154.728 179.791 157.529 179.791Z" fill="#43567A" />
            <path d="M146.106 172.175C148.902 172.175 148.907 167.829 146.106 167.829C143.305 167.829 143.305 172.175 146.106 172.175Z" fill="#43567A" />
            <path d="M147.533 195.498C150.329 195.498 150.334 191.153 147.533 191.153C144.732 191.153 144.732 195.498 147.533 195.498Z" fill="#43567A" />
            <path d="M168.952 167.891C171.749 167.891 171.753 163.545 168.952 163.545C166.151 163.545 166.151 167.891 168.952 167.891Z" fill="#43567A" />
            <path d="M152.769 154.088C155.565 154.088 155.57 149.742 152.769 149.742C149.967 149.742 149.967 154.088 152.769 154.088Z" fill="#43567A" />
            <path d="M167.048 148.376C169.844 148.376 169.849 144.031 167.048 144.031C164.247 144.031 164.247 148.376 167.048 148.376Z" fill="#43567A" />
            <path d="M151.816 40.3261C154.613 40.3261 154.617 35.9802 151.816 35.9802C149.015 35.9802 149.015 40.3261 151.816 40.3261Z" fill="#43567A" />
            <path d="M164.192 50.3212C166.988 50.3212 166.993 45.9753 164.192 45.9753C161.391 45.9753 161.391 50.3212 164.192 50.3212Z" fill="#43567A" />
            <path d="M157.052 56.9848C159.848 56.9848 159.853 52.6389 157.052 52.6389C154.251 52.6389 154.251 56.9848 157.052 56.9848Z" fill="#43567A" />
            <path d="M165.144 73.1686C167.94 73.1686 167.945 68.8228 165.144 68.8228C162.343 68.8228 162.343 73.1686 165.144 73.1686Z" fill="#43567A" />
            <path d="M85.1774 94.1137C87.9737 94.1137 87.9785 89.7678 85.1774 89.7678C82.3763 89.7678 82.3763 94.1137 85.1774 94.1137Z" fill="#43567A" />
            <path d="M84.7004 76.976C87.4967 76.976 87.5014 72.6301 84.7004 72.6301C81.8993 72.6301 81.8993 76.976 84.7004 76.976Z" fill="#43567A" />
            <path d="M75.1832 103.633C77.9795 103.633 77.9843 99.2869 75.1832 99.2869C72.3821 99.2869 72.3821 103.633 75.1832 103.633Z" fill="#43567A" />
            <path d="M91.8401 109.344C94.6364 109.344 94.6412 104.998 91.8401 104.998C89.039 104.998 89.039 109.344 91.8401 109.344Z" fill="#43567A" />
            <path d="M101.836 152.197C104.632 152.197 104.637 147.851 101.836 147.851C99.0351 147.851 99.0351 152.197 101.836 152.197Z" fill="#43567A" />
          </g>

          <g id={`${id}-eye`}>
            <circle cx="123.4" cy="72.4" r="27.5" fill="#C5D2DD" />
            <circle cx="123.4" cy="72.4" r="25.7" fill="#E2EBF5" />
            <g clipPath={`url(#${id}-eye-clip)`}>
              <g id={`${id}-pupil`}>
                <circle cx="123.4" cy="72.4" r="19.95" fill="#F3F7FB" />
                <circle cx="132" cy="72" r="13" fill="#181625" />
                <ellipse cx="138" cy="66" rx="3.5" ry="2.5" fill="#F9FBFD" />
              </g>
              <circle id={`${id}-eyelid`} cx="123.4" cy="20" r="25.7" fill="#8CA5C8" />
            </g>
            <circle cx="123.4" cy="72.4" r="25.7" fill="none" stroke="#88959E" strokeWidth="0.6" opacity="0.42" />
          </g>
        </g>
      </g>
    </>
  );
}

function createRig(
  svgEl: SVGSVGElement,
  id: string,
  initialGrowthLevel: number,
  alive: { current: boolean }
): { handle: RigHandle; stop: () => void } | null {
  const $ = (elemId: string) => svgEl.querySelector<SVGElement>(`#${id}-${elemId}`) as SVGElement;

  const root = $('monster-root');
  const torsoGroup = $('torso-group');
  const eyelid = $('eyelid');
  const pupil = $('pupil');
  const feetLeft = $('feet-left');
  const feetRight = $('feet-right');

  if (!root || !torsoGroup || !eyelid || !pupil || !feetLeft || !feetRight) return null;

  const tentacleDefs = [
    { id: 'tentacle-left-1',  base: [71, 138],  tip: [13, 66],   phase: 0.0 },
    { id: 'tentacle-right-1', base: [178, 138], tip: [236, 66],  phase: 1.9 },
    { id: 'tentacle-left-2',  base: [70, 164],  tip: [1, 179],   phase: 3.1 },
    { id: 'tentacle-right-2', base: [178, 168], tip: [243, 184], phase: 4.3 },
    { id: 'tentacle-left-3',  base: [75, 180],  tip: [36, 233],  phase: 5.5 },
    { id: 'tentacle-right-3', base: [173, 181], tip: [214, 233], phase: 0.9 },
  ];

  const SEGMENTS = 32;
  const WAVELENGTH = 0.9;
  const WAVE_SPEED = 2.2;
  const AMP_BASE = 1.5;
  const AMP_TIP = 18;
  const SECONDARY_AMP = 0.18;
  const CURVE_TENSION = 0.35;

  function updateTentacles(t: number) {
    tentacleDefs.forEach(def => {
      const el = $(def.id);
      if (!el) return;
      const [bx, by] = def.base;
      const [tx, ty] = def.tip;
      const dx = tx - bx;
      const dy = ty - by;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -(dy / len);
      const ny = dx / len;

      const pts: [number, number][] = [];
      for (let i = 0; i <= SEGMENTS; i++) {
        const s = i / SEGMENTS;
        const k = WAVELENGTH * Math.PI * 2;
        const primary = Math.sin(k * s - t * WAVE_SPEED + def.phase);
        const secondary = Math.sin(k * 1.7 * s - t * WAVE_SPEED * 1.3 + def.phase) * SECONDARY_AMP;
        const amp = AMP_BASE + (AMP_TIP - AMP_BASE) * s * s;
        const offset = (primary + secondary) * amp;
        pts.push([bx + dx * s + nx * offset, by + dy * s + ny * offset]);
      }

      let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        const f = (1 - CURVE_TENSION) * 0.5;
        const c1x = p1[0] + (p2[0] - p0[0]) * f;
        const c1y = p1[1] + (p2[1] - p0[1]) * f;
        const c2x = p2[0] - (p3[0] - p1[0]) * f;
        const c2y = p2[1] - (p3[1] - p1[1]) * f;
        d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
      }
      el.setAttribute('d', d);
    });
  }

  const EYE_CX = 123.4;
  const EYE_CY = 72.4;
  const PUPIL_RADIUS = 8;

  const state = {
    breathScale: 1,
    voteScale: 1,
    voteRotate: 0,
    growScale: initialGrowthLevel,
    squatY: 1,
    squatX: 1,
    eyelidY: 20,
    pupilAngle: 0,
    pupilCx: 132,
    pupilCy: 72,
    targetPupilCx: 132,
    targetPupilCy: 72,
  };

  let rollDirection = 1;
  let rollSpeed = 0.5;

  function blink() {
    const duration = 240;
    const startTime = performance.now();
    const restY = 20;
    const closedY = EYE_CY;
    function step(now: number) {
      if (!alive.current) return;
      const t = (now - startTime) / duration;
      if (t >= 1) { state.eyelidY = restY; return; }
      const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
      state.eyelidY = restY + (closedY - restY) * phase;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function scheduleBlink() {
    const delay = 2500 + Math.random() * 2500;
    setTimeout(() => {
      if (!alive.current) return;
      blink();
      if (Math.random() < 0.2) setTimeout(() => { if (alive.current) blink(); }, 300);
      if (alive.current) scheduleBlink();
    }, delay);
  }

  function scheduleEyeChange() {
    const delay = 3000 + Math.random() * 4000;
    setTimeout(() => {
      if (!alive.current) return;
      rollDirection = Math.random() < 0.5 ? -1 : 1;
      rollSpeed = 0.3 + Math.random() * 0.7;
      scheduleEyeChange();
    }, delay);
  }

  function triggerVote() {
    const startTime = performance.now();
    const duration = 450;
    function step(now: number) {
      if (!alive.current) return;
      const t = (now - startTime) / duration;
      if (t >= 1) { state.voteScale = 1; state.voteRotate = 0; return; }
      const damp = Math.exp(-3.5 * t);
      state.voteRotate = damp * Math.sin(t * Math.PI * 6) * 5;
      state.voteScale = 1 + damp * Math.sin(t * Math.PI * 4) * 0.05;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function triggerGrow(targetScale: number) {
    const startScale = state.growScale;
    const duration = 1800;
    const startTime = performance.now();
    function step(now: number) {
      if (!alive.current) return;
      const t = Math.min((now - startTime) / duration, 1);

      if (t < 0.25) {
        const p = t / 0.25;
        const eased = p * p;
        state.squatY = 1 - eased * 0.18;
        state.squatX = 1 + eased * 0.10;
        state.growScale = startScale;
      } else if (t < 0.7) {
        const p = (t - 0.25) / 0.45;
        const c1 = 2.2;
        const c3 = c1 + 1;
        const eased = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
        state.growScale = startScale + (targetScale - startScale) * eased;
        const stretchEase = 1 - Math.pow(1 - p, 3);
        state.squatY = 0.82 + stretchEase * 0.22;
        state.squatX = 1.10 - stretchEase * 0.14;
      } else {
        const p = (t - 0.7) / 0.3;
        const eased = 1 - Math.pow(1 - p, 2);
        state.squatY = 1.04 - eased * 0.04;
        state.squatX = 0.96 + eased * 0.04;
        state.growScale = targetScale;
      }

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        state.squatY = 1;
        state.squatX = 1;
        state.growScale = targetScale;
      }
    }
    requestAnimationFrame(step);
  }

  let lastTime = performance.now();
  let rafHandle = 0;

  function frame(now: number) {
    if (!alive.current) return;
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const t = now / 1000;

    state.breathScale = 1 + Math.sin(t * 1.3) * 0.025;
    const torsoCx = 123.5;
    const torsoCy = 192;
    torsoGroup.setAttribute('transform',
      `translate(${torsoCx} ${torsoCy}) scale(${state.squatX} ${state.breathScale * state.squatY}) translate(${-torsoCx} ${-torsoCy})`
    );

    const idleLift = Math.sin(t * 1.6) * 0.6;
    const squatPress = (1 - state.squatY) * 6;
    feetLeft.setAttribute('transform', `translate(${-squatPress * 0.6} ${idleLift + squatPress * 0.3})`);
    feetRight.setAttribute('transform', `translate(${squatPress * 0.6} ${-idleLift + squatPress * 0.3})`);

    const rootPivotX = 123.5;
    const rootPivotY = 258;
    const totalScale = state.growScale * state.voteScale;
    root.setAttribute('transform',
      `translate(${rootPivotX} ${rootPivotY}) scale(${totalScale}) rotate(${state.voteRotate}) translate(${-rootPivotX} ${-rootPivotY})`
    );

    updateTentacles(t);

    state.pupilAngle += rollSpeed * rollDirection * dt;
    state.targetPupilCx = EYE_CX + Math.cos(state.pupilAngle) * PUPIL_RADIUS;
    state.targetPupilCy = EYE_CY + Math.sin(state.pupilAngle) * PUPIL_RADIUS;
    state.pupilCx += (state.targetPupilCx - state.pupilCx) * 0.08;
    state.pupilCy += (state.targetPupilCy - state.pupilCy) * 0.08;
    pupil.setAttribute('transform', `translate(${state.pupilCx - 132} ${state.pupilCy - 72})`);

    eyelid.setAttribute('cy', String(state.eyelidY));

    rafHandle = requestAnimationFrame(frame);
  }

  scheduleBlink();
  scheduleEyeChange();
  rafHandle = requestAnimationFrame(frame);

  return {
    handle: {
      triggerVote,
      triggerGrow,
      syncScale: (target: number) => { state.growScale = target; },
    },
    stop: () => cancelAnimationFrame(rafHandle),
  };
}

export const cleoCfg: RigConfig = {
  viewBox: '0 0 247 271',
  renderSVG,
  createRig,
};
