import { PIXEL_ICONS } from '@/lib/pixelIcons';

interface PixelIconProps {
  tint?: boolean; // paint the light pixels with the surrounding --r-accent (set by an .accent-* parent)
  name: keyof typeof PIXEL_ICONS;
  className?: string;
}

// Draws a 16x16 bitmap as crisp SVG squares: wine for '#', rose for 'o'.
export default function PixelIcon({ name, className, tint = false }: PixelIconProps) {
  const rows = PIXEL_ICONS[name] ?? [];
  return (
    <svg
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === '.' ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={cell === '#' ? 'var(--wine)' : tint ? 'var(--r-accent, var(--rose))' : 'var(--rose)'} />
          ),
        ),
      )}
    </svg>
  );
}
