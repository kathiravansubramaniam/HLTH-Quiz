import type { ReactNode } from 'react';
import type { RigConfig, RigHandle } from './types';

function renderSVG(id: string): ReactNode {
  return (
    <>
      <defs>
        <clipPath id={`${id}-eye-clip`}>
          <circle cx="116" cy="41" r="17" />
        </clipPath>
      </defs>

      <g id={`${id}-root`}>
        <g id={`${id}-Body`}>
          <g id={`${id}-BodyFrame`}>
            <path d="M86.085 92.9951H80.8793C80.2007 92.9951 79.5634 93.3292 79.1839 93.8923C77.7258 96.0579 74.7207 102.206 77.8743 113.028C78.13 113.904 78.9344 114.509 79.846 114.509H85.689C86.3139 114.509 86.813 113.991 86.7924 113.366L86.085 92.9972V92.9951Z" fill="#ACC231" />
            <path d="M98.5036 99.5746H89.5113C89.5113 99.5746 89.3236 93.2016 86.0855 92.9954C83.0764 92.8056 81.6244 108.383 84.483 113.622C84.9408 114.462 86.0195 114.767 86.8321 114.264C87.8056 113.659 88.9255 112.15 89.305 108.472H96.0122L98.5036 99.5746Z" fill="#DCFA3A" />
            <path d="M64.6661 187.063C64.6661 187.063 46.2833 170.196 52.1263 163.798C57.9672 157.4 76.4469 161.618 76.4469 161.618L64.6661 187.061V187.063Z" fill="#DCFA3A" />
            <path d="M91.1686 123.86C91.1686 123.86 66.254 122.575 65.7879 131.227C65.3218 139.879 81.2832 150.099 81.2832 150.099L91.1686 123.862V123.86Z" fill="#DCFA3A" />
            <path d="M139.514 103.096C138.229 93.3958 138.128 91.585 138.128 91.585L133.128 63.085L101.218 75.3286C103.179 92.3399 88.4593 130.939 79.6278 152.855C70.7963 174.771 47.8988 210.101 60.9831 245.101C74.0674 280.101 110.049 275.194 110.049 275.194C110.049 275.194 193.464 275.52 209.819 275.194C226.174 274.868 222.903 257.857 223.885 242.483C224.867 227.11 229.773 206.83 211.129 206.174C192.484 205.518 195.427 236.267 195.427 236.267H153.229C154.211 197.342 140.799 112.795 139.514 103.096Z" fill="#DCFA3A" />
            <path d="M118.658 87.8812C116.216 83.7975 113.263 79.9468 110.115 76.3911C109.162 75.3144 108.163 74.3086 107.128 73.3501L133.128 62.585L138.628 93.085C138.628 93.085 138.784 94.6605 140.066 104.36C140.749 109.516 144.858 135.817 148.411 165.174C147.673 165.902 146.92 166.614 146.138 167.297C145.689 167.596 145.231 167.882 144.767 168.154L143.397 168.324C142.595 167.897 141.822 167.435 141.067 166.942C140.262 166.212 139.497 165.44 138.769 164.632C137.802 163.172 136.94 161.647 136.173 160.074C134.228 154.759 133.093 149.178 132.26 143.582C131.716 139.119 131.284 134.641 130.779 130.174C130.033 123.57 129.311 116.869 127.743 110.395C126.964 107.176 125.976 104.006 124.753 100.926C122.981 96.4713 121.125 92.0061 118.658 87.8812Z" fill="#ACC231" />

            <g id={`${id}-Texture`}>
              <path d="M120.446 205.33C122.968 205.33 122.972 201.411 120.446 201.411C117.919 201.411 117.919 205.33 120.446 205.33Z" fill="#ACC231" />
              <path d="M131.705 206.134C134.228 206.134 134.232 202.215 131.705 202.215C129.179 202.215 129.179 206.134 131.705 206.134Z" fill="#ACC231" />
              <path d="M126.879 219.002C129.402 219.002 129.406 215.083 126.879 215.083C124.353 215.083 124.353 219.002 126.879 219.002Z" fill="#ACC231" />
              <path d="M126.074 237.5C128.596 237.5 128.6 233.582 126.074 233.582C123.547 233.582 123.547 237.5 126.074 237.5Z" fill="#ACC231" />
              <path d="M132.106 266.452C134.629 266.452 134.633 262.534 132.106 262.534C129.58 262.534 129.58 266.452 132.106 266.452Z" fill="#ACC231" />
              <path d="M145.377 258.411C147.9 258.411 147.904 254.493 145.377 254.493C142.851 254.493 142.851 258.411 145.377 258.411Z" fill="#ACC231" />
              <path d="M148.593 268.464C151.115 268.464 151.12 264.545 148.593 264.545C146.067 264.545 146.067 268.464 148.593 268.464Z" fill="#ACC231" />
              <path d="M167.091 268.061C169.614 268.061 169.618 264.143 167.091 264.143C164.565 264.143 164.565 268.061 167.091 268.061Z" fill="#ACC231" />
              <path d="M171.515 252.379C174.037 252.379 174.041 248.46 171.515 248.46C168.988 248.46 168.988 252.379 171.515 252.379Z" fill="#ACC231" />
              <path d="M183.981 261.626C186.503 261.626 186.507 257.708 183.981 257.708C181.454 257.708 181.454 261.626 183.981 261.626Z" fill="#ACC231" />
              <path d="M203.683 265.246C206.206 265.246 206.21 261.328 203.683 261.328C201.157 261.328 201.157 265.246 203.683 265.246Z" fill="#ACC231" />
              <path d="M202.477 253.988C205 253.988 205.004 250.069 202.477 250.069C199.951 250.069 199.951 253.988 202.477 253.988Z" fill="#ACC231" />
              <path d="M214.139 243.131C216.662 243.131 216.666 239.212 214.139 239.212C211.613 239.212 211.613 243.131 214.139 243.131Z" fill="#ACC231" />
              <path d="M215.346 264.844C217.868 264.844 217.872 260.926 215.346 260.926C212.819 260.926 212.819 264.844 215.346 264.844Z" fill="#ACC231" />
              <path d="M68.9722 194.473C71.4946 194.473 71.4987 190.554 68.9722 190.554C66.4457 190.554 66.4457 194.473 68.9722 194.473Z" fill="#ACC231" />
              <path d="M77.8213 182.811C80.3437 182.811 80.3478 178.893 77.8213 178.893C75.2948 178.893 75.2948 182.811 77.8213 182.811Z" fill="#ACC231" />
              <path d="M83.0467 168.335C85.5691 168.335 85.5733 164.417 83.0467 164.417C80.5202 164.417 80.5202 168.335 83.0467 168.335Z" fill="#ACC231" />
              <path d="M93.9072 172.357C96.4296 172.357 96.4337 168.438 93.9072 168.438C91.3807 168.438 91.3807 172.357 93.9072 172.357Z" fill="#ACC231" />
              <path d="M101.948 116.864C104.47 116.864 104.474 112.946 101.948 112.946C99.421 112.946 99.421 116.864 101.948 116.864Z" fill="#ACC231" />
              <path d="M94.3081 132.949C96.8305 132.949 96.8346 129.031 94.3081 129.031C91.7816 129.031 91.7816 132.949 94.3081 132.949Z" fill="#ACC231" />
              <path d="M105.97 142.197C108.493 142.197 108.497 138.279 105.97 138.279C103.444 138.279 103.444 142.197 105.97 142.197Z" fill="#ACC231" />
              <path d="M103.959 128.927C106.481 128.927 106.486 125.009 103.959 125.009C101.432 125.009 101.432 128.927 103.959 128.927Z" fill="#ACC231" />
            </g>

            {/* Tail — rotated via SVG rotate(angle 108 275) in the rig */}
            <g id={`${id}-Tail`}>
              <path d="M60.9825 245.098C60.9825 245.098 49.0697 258.211 28.5233 266.009C7.97704 273.807 27.7726 275.426 27.7726 275.426H108.46L60.9825 245.096V245.098Z" fill="#DCFA3A" />
            </g>

            {/* Hand — rotated via SVG rotate(angle 99 168) in the rig */}
            <g id={`${id}-Hand`}>
              <path d="M95.6539 166.258C95.46 166.316 95.262 166.357 95.064 166.4C93.1665 166.811 84.3784 169.432 82.353 183.102C80.0802 198.449 86.8513 236.633 77.9228 249.039C68.9944 261.445 69.5637 263.25 73.2575 265.522C76.7555 267.676 104.723 273.397 117.091 254.688C118.382 252.737 119.081 250.454 119.143 248.115C119.298 242.318 119.273 229.675 116.741 218.913C113.771 206.295 113.818 184.199 107.693 172.689C105.915 169.348 102.761 166.912 99.0425 166.208C97.8855 165.99 96.6975 165.947 95.6539 166.26V166.258Z" fill="#ACC231" />
            </g>

            {/* Lower jaw — rotated via SVG rotate(angle 146 55) in the rig */}
            <g id={`${id}-LowerJaw`}>
              <g id={`${id}-Teeth`}>
                <path d="M227.325 70.9105C227.325 70.9105 228.669 61.3839 222.387 60.6786C216.105 59.9732 212.745 68.5221 212.745 68.5221L227.325 70.9105Z" fill="white" />
                <path d="M241.468 73.0516C241.468 73.0516 242.813 63.5251 236.531 62.8197C230.249 62.1143 226.889 70.6633 226.889 70.6633L241.468 73.0516Z" fill="white" />
                <path d="M213.499 68.7012C213.499 68.7012 214.844 59.1747 208.562 58.4693C202.279 57.764 198.919 66.3129 198.919 66.3129L213.499 68.7012Z" fill="white" />
                <path d="M199.568 66.2716C199.568 66.2716 200.913 56.745 194.63 56.0397C188.348 55.3343 184.988 63.8832 184.988 63.8832L199.568 66.2716Z" fill="white" />
                <path d="M185.41 63.7557C185.41 63.7557 186.755 54.2292 180.473 53.5238C174.191 52.8184 170.831 61.3674 170.831 61.3674L185.41 63.7557Z" fill="white" />
              </g>
              <path id={`${id}-Jaw`} d="M146.04 54.585C146.04 54.585 145.957 56.4804 148.014 56.9547H148.016C150.07 57.4291 243.683 72.5965 243.683 72.5965C243.683 72.5965 246.765 91.5568 210.267 86.3428C173.77 81.1289 163.579 77.5732 158.365 78.2848C153.151 78.9963 141.3 79.4707 137.272 91.794L108.115 75.3911C107.162 74.3144 106.163 73.3086 105.128 72.3501L146.04 54.585Z" fill="#ACC231" />
            </g>

            <g id={`${id}-Teeth2`}>
              <path d="M181.567 39.6477C181.567 39.6477 185.273 48.5266 191.036 45.9258C196.799 43.325 195.324 34.2605 195.324 34.2605L181.567 39.6477Z" fill="white" />
              <path d="M194.961 34.3056C194.961 34.3056 198.667 43.1846 204.43 40.5838C210.192 37.983 208.718 28.9185 208.718 28.9185L194.961 34.3056Z" fill="white" />
              <path d="M208.22 29.5554C208.22 29.5554 211.926 38.4343 217.689 35.8335C223.451 33.2328 221.977 24.1682 221.977 24.1682L208.22 29.5554Z" fill="white" />
              <path d="M221.344 24.5503C221.344 24.5503 225.05 33.4292 230.813 30.8284C236.575 28.2276 235.101 19.1631 235.101 19.1631L221.344 24.5503Z" fill="white" />
            </g>

            <path id={`${id}-Face`} d="M148.082 56.1689C148.082 56.1689 147.582 55.569 149.602 54.126C162.81 44.6922 250.325 14.4296 250.325 14.4296C244.841 -4.27488 223.393 2.96232 223.393 2.96232C223.393 2.96232 174.261 18.6598 170.388 19.4765C166.514 20.2932 146.127 22.331 132.469 16.622C118.809 10.9131 94.7527 10.3026 88.2291 32.7279C81.7055 55.1531 92.1025 67.1814 95.9758 69.8317C99.0839 71.9581 100.87 75.2312 101.456 76.4398C102.431 75.9386 103.407 75.4395 104.387 74.9486C110.316 71.9808 148.082 56.1689 148.082 56.1689Z" fill="#ACC231" />

            <g id={`${id}-Eye`}>
              <path d="M128.084 53.1997C134.841 46.4429 134.841 35.4878 128.084 28.7309C121.327 21.9741 110.372 21.9741 103.615 28.7309C96.8581 35.4878 96.8581 46.4429 103.615 53.1997C110.372 59.9566 121.327 59.9566 128.084 53.1997Z" fill="#C5D2DD" />
              <path d="M116.254 58.4617C125.495 58.4617 132.987 50.9702 132.987 41.7289C132.987 32.4876 125.495 24.9961 116.254 24.9961C107.013 24.9961 99.5212 32.4876 99.5212 41.7289C99.5212 50.9702 107.013 58.4617 116.254 58.4617Z" fill="#E2EBF5" />
              <g opacity="0.57">
                <path d="M117.824 52.1091C124.59 52.1091 130.075 46.6241 130.075 39.858C130.075 33.0919 124.59 27.6069 117.824 27.6069C111.058 27.6069 105.573 33.0919 105.573 39.858C105.573 46.6241 111.058 52.1091 117.824 52.1091Z" fill="#F3F7FB" />
              </g>
              <path d="M114.746 28.8344C114.746 28.8344 127.718 29.0572 128.147 42.5911C128.164 43.1212 128.847 42.4529 129.645 42.389C130.317 42.3333 131.02 42.9417 131.037 42.6344C131.687 29.6471 118.573 25.1571 114.013 26.7596C113.927 26.7905 114.748 28.8365 114.748 28.8365L114.746 28.8344Z" fill="#F9FBFD" />
              <path d="M110.175 30.377C110.175 30.377 111.786 29.4839 113.756 29.1313L113.071 26.9842C111.959 26.9347 109.895 27.9123 109.086 28.7167C108.894 28.9064 110.175 30.377 110.175 30.377Z" fill="#F9FBFD" />
              <g opacity="0.42">
                <path d="M100.574 43.4739C100.935 45.5178 101.673 47.4421 102.77 49.191C103.907 51.004 105.379 52.5487 107.145 53.7862C108.91 55.0237 110.87 55.8776 112.961 56.3251C114.982 56.7562 117.043 56.7933 119.086 56.4324C121.13 56.0714 123.055 55.3331 124.804 54.2358C126.616 53.0994 128.161 51.6268 129.399 49.8614C130.636 48.0959 131.49 46.1365 131.938 44.0452C132.369 42.024 132.406 39.9636 132.045 37.9197C131.684 35.8758 130.946 33.9515 129.848 32.2025C128.712 30.3896 127.239 28.8448 125.474 27.6073C123.706 26.3698 121.749 25.516 119.658 25.0684C117.636 24.6374 115.576 24.6002 113.532 24.9612C111.488 25.3221 109.564 26.0605 107.815 27.1577C106.002 28.2941 104.457 29.7667 103.22 31.5322C101.982 33.2997 101.128 35.257 100.681 37.3484C100.25 39.3696 100.213 41.43 100.574 43.4739Z" fill="#88959E" />
              </g>

              <g clipPath={`url(#${id}-eye-clip)`}>
                <g id={`${id}-EyeBall`}>
                  <circle cx="116" cy="41" r="13" fill="#F3F7FB" />
                  <circle cx="122" cy="41" r="8" fill="#181625" />
                  <ellipse cx="126" cy="37" rx="2.3" ry="1.6" fill="#F9FBFD" />
                </g>
                <ellipse id={`${id}-Eyelid`} cx="116" cy="41" rx="20" ry="22" fill="#ACC231" opacity="0" />
              </g>
            </g>
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

  const root = $('root');
  const hand = $('Hand');
  const tail = $('Tail');
  const lowerJaw = $('LowerJaw');
  const eyeBall = $('EyeBall');
  const eyelid = $('Eyelid');

  if (!root || !hand || !tail || !lowerJaw || !eyeBall || !eyelid) return null;

  const PUPIL_RADIUS = 4;
  const EYELID_REST_Y = 15;
  const EYELID_CLOSED_Y = 41;

  const state = {
    voteScale: 1,
    voteRotate: 0,
    growScale: initialGrowthLevel,
    squatY: 1,
    squatX: 1,
    mouthCurrent: 0,
    mouthTarget: 0,
    handWaving: false,
    handWaveStart: 0,
    pupilAngle: 0,
    pupilCx: 0,
    pupilCy: 0,
    targetCx: 0,
    targetCy: 0,
    eyelidY: EYELID_REST_Y,
  };

  let mouthOpen = false;
  let rollDirection = 1;
  let rollSpeed = 0.5;

  function blink() {
    const duration = 220;
    const startTime = performance.now();
    function step(now: number) {
      if (!alive.current) return;
      const t = (now - startTime) / duration;
      if (t >= 1) { state.eyelidY = EYELID_REST_Y; return; }
      const phase = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
      state.eyelidY = EYELID_REST_Y + (EYELID_CLOSED_Y - EYELID_REST_Y) * phase;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function scheduleBlink() {
    const delay = 2500 + Math.random() * 2500;
    setTimeout(() => {
      if (!alive.current) return;
      blink();
      if (Math.random() < 0.2) setTimeout(() => { if (alive.current) blink(); }, 280);
      if (alive.current) scheduleBlink();
    }, delay);
  }

  function scheduleEyeChange() {
    const delay = 3000 + Math.random() * 4000;
    setTimeout(() => {
      if (!alive.current) return;
      rollDirection = Math.random() < 0.5 ? -1 : 1;
      rollSpeed = 0.3 + Math.random() * 0.6;
      scheduleEyeChange();
    }, delay);
  }

  function scheduleAutoMouth() {
    const delay = 4000 + Math.random() * 4000;
    setTimeout(() => {
      if (!alive.current) return;
      if (!mouthOpen) {
        state.mouthTarget = 0.7;
        setTimeout(() => { if (alive.current && !mouthOpen) state.mouthTarget = 0; }, 500);
      }
      scheduleAutoMouth();
    }, delay);
  }

  function triggerWave() {
    state.handWaving = true;
    state.handWaveStart = performance.now();
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
    state.mouthTarget = 0.6;
    setTimeout(() => { if (alive.current && !mouthOpen) state.mouthTarget = 0; }, 400);
    triggerWave();
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
    state.mouthTarget = 1;
    setTimeout(() => { if (alive.current && !mouthOpen) state.mouthTarget = 0; }, 1600);
  }

  const GROUND_Y = 293;
  const PIVOT_X = 126.5;

  let lastTime = performance.now();
  let rafHandle = 0;

  function frame(now: number) {
    if (!alive.current) return;
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const t = now / 1000;

    // Root — no breathing, just grow + vote wobble + squat, pivoting from the ground
    const totalScaleY = state.growScale * state.voteScale * state.squatY;
    const totalScaleX = state.growScale * state.voteScale * state.squatX;
    root.setAttribute('transform',
      `translate(${PIVOT_X} ${GROUND_Y}) scale(${totalScaleX} ${totalScaleY}) rotate(${state.voteRotate}) translate(${-PIVOT_X} ${-GROUND_Y})`
    );

    // Mouth — lerp and rotate lower jaw around its hinge point
    state.mouthCurrent += (state.mouthTarget - state.mouthCurrent) * 0.18;
    const jawAngle = state.mouthCurrent * 22;
    lowerJaw.setAttribute('transform', `rotate(${jawAngle} 146 55)`);

    // Hand — wave burst or idle sway; SVG rotate(angle cx cy) keeps pivot exact
    let handAngle: number;
    if (state.handWaving) {
      const elapsed = (now - state.handWaveStart) / 1000;
      if (elapsed >= 2.6) {
        state.handWaving = false;
        handAngle = 0;
      } else {
        const damp = Math.exp(-0.6 * elapsed);
        handAngle = Math.sin(elapsed * Math.PI * 3) * 70 * damp;
      }
    } else {
      handAngle = Math.sin(t * 1.8) * 5;
    }
    hand.setAttribute('transform', `rotate(${handAngle} 99 168)`);

    // Tail — tight wag (≤2° to avoid exposing the seam with the body)
    const tailAngle = Math.sin(t * 1.4) * 1.8 + Math.sin(t * 2.7) * 0.6;
    tail.setAttribute('transform', `rotate(${tailAngle} 108 275)`);

    // Eye drift
    state.pupilAngle += rollSpeed * rollDirection * dt;
    state.targetCx = Math.cos(state.pupilAngle) * PUPIL_RADIUS;
    state.targetCy = Math.sin(state.pupilAngle) * PUPIL_RADIUS;
    state.pupilCx += (state.targetCx - state.pupilCx) * 0.08;
    state.pupilCy += (state.targetCy - state.pupilCy) * 0.08;
    eyeBall.setAttribute('transform', `translate(${state.pupilCx} ${state.pupilCy})`);

    // Eyelid — visible only while blinking (cy > rest + margin)
    const blinking = state.eyelidY > EYELID_REST_Y + 0.5;
    eyelid.setAttribute('cy', String(state.eyelidY));
    eyelid.setAttribute('opacity', blinking ? '1' : '0');

    rafHandle = requestAnimationFrame(frame);
  }

  scheduleBlink();
  scheduleEyeChange();
  scheduleAutoMouth();
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

export const abominableCfg: RigConfig = {
  viewBox: '0 0 253 293',
  renderSVG,
  createRig,
};
