import { memo } from 'react';
import { SPEC_ICONS } from '@/lib/specIcons';
import { centreRows, pathData, scale2x } from '@/lib/scale2x';

interface SpecPixelIconProps {
  name: string;
  size?: number; // 48 = 1.5px per art pixel of the 32x32 sprite
  className?: string;
}

const GRID = 32;
const CACHE = new Map<string, { wine: string; accent: string }>();

function spriteFor(name: string) {
  let sprite = CACHE.get(name);
  if (!sprite) {
    const rows = centreRows(scale2x(SPEC_ICONS[name] ?? SPEC_ICONS.cpu), GRID);
    sprite = { wine: pathData(rows, '#'), accent: pathData(rows, 'o') };
    CACHE.set(name, sprite);
  }
  return sprite;
}

// Unboxed 32x32 pixel sprite (a 16x16 drawing run through Scale2x): # = wine, o = rose.
// Drawn as two <path>s (one per colour) so a page of 16 icons stays a few dozen DOM nodes.
function SpecPixelIcon({ name, size = 48, className }: SpecPixelIconProps) {
  const sprite = spriteFor(name);
  return (
    <svg viewBox={`0 0 ${GRID} ${GRID}`} width={size} height={size} shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path d={sprite.accent} fill="var(--card-accent, var(--rose))" />
      <path d={sprite.wine} fill="var(--wine)" />
    </svg>
  );
}

export default memo(SpecPixelIcon);
