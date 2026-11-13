import { useEffect, useState } from 'react';

// The window is designed at 800x600 (plus tab bar and shadow). On big screens
// the whole thing is scaled up to fill the viewport; on phones and small
// windows this returns null and the window simply fills the screen instead.
const STAGE_WIDTH = 808;
const STAGE_HEIGHT = 656;
const MIN_VIEWPORT_WIDTH = 900;
const MIN_VIEWPORT_HEIGHT = 620;
const MAX_SCALE = 1.75;
const MARGIN = 48;

function computeScale(): number | null {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width < MIN_VIEWPORT_WIDTH || height < MIN_VIEWPORT_HEIGHT) return null;
  return Math.min(MAX_SCALE, (width - MARGIN) / STAGE_WIDTH, (height - MARGIN) / STAGE_HEIGHT);
}

export function useStageScale() {
  const [scale, setScale] = useState(computeScale);

  useEffect(() => {
    const onResize = () => setScale(computeScale());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return scale;
}
