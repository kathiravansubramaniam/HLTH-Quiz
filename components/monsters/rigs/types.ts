import type { ReactNode } from 'react';

export interface RigHandle {
  triggerVote: () => void;
  triggerGrow: (targetScale: number) => void;
  syncScale: (targetScale: number) => void;
}

export interface RigConfig {
  viewBox: string;
  renderSVG: (id: string) => ReactNode;
  createRig: (
    svgEl: SVGSVGElement,
    id: string,
    initialGrowthLevel: number,
    alive: { current: boolean }
  ) => { handle: RigHandle; stop: () => void } | null;
}
