import { SPEC_ICONS } from '@/lib/specIcons';
import { centreRows, runs, scale2x } from '@/lib/scale2x';

interface SpecPixelIconProps {
  name: string;
  size?: number; // 48 = 1.5px per art pixel of the 32x32 sprite
  className?: string;
}

const GRID = 32;
const CACHE = new Map<string, { x: number; y: number; w: number; ch: string }[]>();

function spriteFor(name: string) {
  let sprite = CACHE.get(name);
  if (!sprite) {
    sprite = runs(centreRows(scale2x(SPEC_ICONS[name] ?? SPEC_ICONS.cpu), GRID));
    CACHE.set(name, sprite);
  }
  return sprite;
}

// Unboxed 32x32 pixel sprite (a 16x16 drawing run through Scale2x): # = wine, o = rose.
export default function SpecPixelIcon({ name, size = 48, className }: SpecPixelIconProps) {
  return (
    <svg viewBox={`0 0 ${GRID} ${GRID}`} width={size} height={size} shapeRendering="crispEdges" aria-hidden="true" className={className}>
      {spriteFor(name).map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height="1" fill={r.ch === 'o' ? 'var(--card-accent, var(--rose))' : 'var(--wine)'} />
      ))}
    </svg>
  );
}
