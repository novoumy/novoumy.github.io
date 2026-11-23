import { SPEC_ICONS, SPEC_ICON_GRID } from '@/lib/specIcons';

interface SpecPixelIconProps {
  name: string;
  size?: number; // multiples of 12 keep every art pixel a whole number of px (48 = 4px per pixel)
  className?: string;
}

// Unboxed 12x12 pixel icon: # = wine, o = rose. Rows are centred vertically in the grid.
export default function SpecPixelIcon({ name, size = 48, className }: SpecPixelIconProps) {
  const rows = SPEC_ICONS[name] ?? SPEC_ICONS.cpu;
  const offset = Math.floor((SPEC_ICON_GRID - rows.length) / 2);
  return (
    <svg
      viewBox={`0 0 ${SPEC_ICON_GRID} ${SPEC_ICON_GRID}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === '.' ? null : (
            <rect key={`${x}-${y}`} x={x} y={y + offset} width="1" height="1" fill={cell === 'o' ? 'var(--rose)' : 'var(--wine)'} />
          ),
        ),
      )}
    </svg>
  );
}
