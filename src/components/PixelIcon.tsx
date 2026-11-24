import { PIXEL_ICONS } from '@/lib/pixelIcons';
import { runs, scale2x } from '@/lib/scale2x';

interface PixelIconProps {
  tint?: boolean; // use the folder accent colour for the shaded ('o') pixels
  hd?: boolean; // draw as a 32x32 sprite (the 16x16 art run through Scale2x) for smoother, more detailed edges
  name: keyof typeof PIXEL_ICONS;
  className?: string;
}

// Pixel treatment:
//   # = body (wine), o = shaded pixel (rose / folder accent).
export default function PixelIcon({ name, className, tint = false, hd = false }: PixelIconProps) {
  const base = PIXEL_ICONS[name] ?? [];
  const rows = hd ? scale2x(base) : base;
  const grid = hd ? 32 : 16;
  const accentColor = tint ? 'var(--r-accent, var(--rose))' : 'var(--rose)';

  return (
    <svg viewBox={`0 0 ${grid} ${grid}`} shapeRendering="crispEdges" aria-hidden="true" className={className}>
      {runs(rows).map((r) => (
        <rect key={`pixel-${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height="1" fill={r.ch === 'o' ? accentColor : 'var(--wine)'} />
      ))}
    </svg>
  );
}
