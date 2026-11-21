import { PIXEL_ICONS } from '@/lib/pixelIcons';

interface PixelIconProps {
  tint?: boolean; // use the folder accent colour for the shaded ('o') pixels
  name: keyof typeof PIXEL_ICONS;
  className?: string;
}

// Pixel treatment:
//   # = body (wine), o = shaded pixel (rose / folder accent).
export default function PixelIcon({ name, className, tint = false }: PixelIconProps) {
  const rows = PIXEL_ICONS[name] ?? [];
  const accentColor = tint ? 'var(--r-accent, var(--rose))' : 'var(--rose)';

  return (
    <svg
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) => {
          if (cell === '.') return null;
          const fill = cell === 'o' ? accentColor : 'var(--wine)';
          return <rect key={`pixel-${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />;
        }),
      )}
    </svg>
  );
}
