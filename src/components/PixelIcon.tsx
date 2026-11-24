import { memo } from 'react';
import { PIXEL_ICONS } from '@/lib/pixelIcons';
import { pathData, scale2x } from '@/lib/scale2x';

interface PixelIconProps {
  tint?: boolean; // use the folder accent colour for the shaded ('o') pixels
  hd?: boolean; // draw as a 32x32 sprite (the 16x16 art run through Scale2x) for smoother, more detailed edges
  name: keyof typeof PIXEL_ICONS;
  className?: string;
}

const CACHE = new Map<string, { grid: number; wine: string; accent: string }>();

function spriteFor(name: string, hd: boolean) {
  const smooth = hd;
  const key = `${name}:${smooth}`;
  let sprite = CACHE.get(key);
  if (!sprite) {
    const base = PIXEL_ICONS[name as keyof typeof PIXEL_ICONS] ?? [];
    const rows = smooth ? scale2x(base) : base;
    sprite = { grid: smooth ? 32 : 16, wine: pathData(rows, '#'), accent: pathData(rows, 'o') };
    CACHE.set(key, sprite);
  }
  return sprite;
}

// Pixel treatment:
//   # = body (wine), o = shaded pixel (rose / folder accent).
// Each colour is one merged <path>, so an icon is two DOM nodes instead of hundreds of <rect>s.
function PixelIcon({ name, className, tint = false, hd = false }: PixelIconProps) {
  const sprite = spriteFor(String(name), hd);
  const accentColor = tint ? 'var(--r-accent, var(--rose))' : 'var(--rose)';

  return (
    <svg viewBox={`0 0 ${sprite.grid} ${sprite.grid}`} shapeRendering="crispEdges" aria-hidden="true" className={className}>
      <path d={sprite.accent} fill={accentColor} />
      <path d={sprite.wine} fill="var(--wine)" />
    </svg>
  );
}

export default memo(PixelIcon);
