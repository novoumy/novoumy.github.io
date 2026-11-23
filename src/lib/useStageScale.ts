import { useEffect, useState } from 'react';

// The window is designed at 800x600 (plus tab bar and shadow). On EVERY device and window size the whole thing
// is scaled (up or down) to fit the viewport, so the layout and 4:3 shape never change. The layout itself never
// reflows: width/height media queries are resolved to the desktop rules at build time (postcss-fixed-viewport.js).
const STAGE_WIDTH = 808;
const STAGE_HEIGHT = 656;
const MIN_SCALE = 0.1;
const MAX_SCALE = 1.75;
const HORIZONTAL_MARGIN = 24; // 12px on each side
const VERTICAL_MARGIN = 64; // 32px above and below

function computeScale(): number {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return Math.max(
    MIN_SCALE,
    Math.min(MAX_SCALE, (width - HORIZONTAL_MARGIN) / STAGE_WIDTH, (height - VERTICAL_MARGIN) / STAGE_HEIGHT),
  );
}

export function useStageScale() {
  const [scale, setScale] = useState(computeScale);

  useEffect(() => {
    const onResize = () => setScale(computeScale());
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return scale;
}
