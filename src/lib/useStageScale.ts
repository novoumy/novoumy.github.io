import { useEffect, useLayoutEffect, useState } from 'react';

// The site has exactly TWO layouts, and nothing in between:
//
//   landscape  4:3  800x600 window  (wide screens)
//   portrait   3:4  420x560 window  (narrow screens / phones)
//
// Each layout is a fixed-size "stage" that is scaled uniformly (up or down) to fit the viewport, so the pixel art
// and spacing never reflow or distort. Resizing only ever switches between the two stages (and re-scales them).
// Width/height media queries are resolved per stage at build time (postcss-fixed-viewport.js) and scoped to
// `html[data-stage='landscape' | 'portrait']`, which this hook keeps in sync.
export type StageMode = 'landscape' | 'portrait';

type StageSpec = {
  /** Stage footprint in CSS px: window + tab bar + drop shadow. */
  width: number;
  height: number;
};

export const STAGES: Record<StageMode, StageSpec> = {
  landscape: { width: 808, height: 656 }, // 800x600 window (4:3)
  portrait: { width: 428, height: 616 }, // 420x560 window (3:4)
};

// Narrow windows, and anything taller than it is wide, get the vertical 3:4 window.
const PORTRAIT_BELOW_WIDTH = 860;

const MIN_SCALE = 0.1;
const MAX_SCALE: Record<StageMode, number> = { landscape: 1.75, portrait: 3 };
// Phones keep a tight, fixed margin. On larger screens (e.g. a vertical PC monitor) the margin grows with the
// screen so the window fills most of it but always leaves a comfortable border of background on every side.
const MARGIN_X = 12; // px per side (minimum)
const MARGIN_Y = 32; // px per side (minimum)
const LARGE_SCREEN_WIDTH = 700;
const LARGE_SCREEN_MARGIN = 0.05; // 5% of the width / height per side

export function computeMode(): StageMode {
  if (typeof window === 'undefined') return 'landscape';
  const { innerWidth, innerHeight } = window;
  return innerWidth < PORTRAIT_BELOW_WIDTH || innerWidth < innerHeight ? 'portrait' : 'landscape';
}

export function computeScale(mode: StageMode): number {
  if (typeof window === 'undefined') return 1;
  const stage = STAGES[mode];
  const { innerWidth, innerHeight } = window;
  const proportional = mode === 'portrait' && innerWidth >= LARGE_SCREEN_WIDTH ? LARGE_SCREEN_MARGIN : 0; // landscape margins are unchanged
  const marginX = Math.max(MARGIN_X, innerWidth * proportional);
  const marginY = Math.max(MARGIN_Y, innerHeight * proportional);
  return Math.max(
    MIN_SCALE,
    Math.min(MAX_SCALE[mode], (innerWidth - 2 * marginX) / stage.width, (innerHeight - 2 * marginY) / stage.height),
  );
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function useStage(): { mode: StageMode; scale: number } {
  const [state, setState] = useState(() => {
    const mode = computeMode();
    return { mode, scale: computeScale(mode) };
  });

  // Publish the active stage on <html> before paint so the scoped CSS applies on the very first frame.
  useIsomorphicLayoutEffect(() => {
    document.documentElement.dataset.stage = state.mode;
  }, [state.mode]);

  useEffect(() => {
    // Resize fires many times per frame while dragging; the stage uses CSS zoom (a full relayout), so coalesce to one
    // update per frame.
    let frame = 0;
    const apply = () => {
      frame = 0;
      const mode = computeMode();
      const scale = computeScale(mode);
      setState((prev) => (prev.mode === mode && prev.scale === scale ? prev : { mode, scale }));
    };
    const onResize = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return state;
}

/** Back-compat: just the scale of the active stage. */
export function useStageScale() {
  return useStage().scale;
}
