import { PIXEL_ICONS } from '@/lib/pixelIcons';

interface PixelIconProps {
  tint?: boolean; // preserve the existing accent color behavior in light mode
  name: keyof typeof PIXEL_ICONS;
  className?: string;
}

const DIRECTIONS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],            [1, 0],
  [-1, 1],  [0, 1],   [1, 1],
] as const;

// Find enclosed empty pixels so dark mode can shade inner recesses without
// changing the bitmap data or drawing a new backing shape around the icon.
function findEnclosedPixels(rows: string[], width: number, height: number): Set<string> {
  const outside = new Set<string>();
  const queue: Array<[number, number]> = [];
  const key = (x: number, y: number) => `${x},${y}`;
  const isEmpty = (x: number, y: number) => rows[y]?.[x] === '.';
  const addOutside = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height || !isEmpty(x, y)) return;
    const cellKey = key(x, y);
    if (outside.has(cellKey)) return;
    outside.add(cellKey);
    queue.push([x, y]);
  };

  for (let x = 0; x < width; x += 1) {
    addOutside(x, 0);
    addOutside(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    addOutside(0, y);
    addOutside(width - 1, y);
  }

  for (let index = 0; index < queue.length; index += 1) {
    const [x, y] = queue[index];
    for (const [dx, dy] of DIRECTIONS) addOutside(x + dx, y + dy);
  }

  const enclosed = new Set<string>();
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (isEmpty(x, y) && !outside.has(key(x, y))) enclosed.add(key(x, y));
    }
  }
  return enclosed;
}

// Pixel treatment:
//   # = mid-tone body, o = shadow/recess, exposed top edges = cream highlight.
// A small offset shadow adds a crisp lower/right bevel in /theme. All variables
// have fallbacks that preserve the original wine/rose rendering in light mode.
export default function PixelIcon({ name, className, tint = false }: PixelIconProps) {
  const rows = PIXEL_ICONS[name] ?? [];
  const height = rows.length;
  const width = Math.max(0, ...rows.map((row) => row.length));
  const enclosed = findEnclosedPixels(rows, width, height);
  const visible = (x: number, y: number) => {
    const cell = rows[y]?.[x];
    return cell !== undefined && cell !== '.';
  };
  const accentColor = tint ? 'var(--r-accent, var(--rose))' : 'var(--rose)';

  return (
    <svg
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      {/* Enclosed empty pixels become dark recesses in /theme; stay transparent in light mode. */}
      {[...enclosed].map((coordinate) => {
        const [x, y] = coordinate.split(',').map(Number);
        return <rect key={`recess-${coordinate}`} x={x} y={y} width="1" height="1" fill="var(--pixel-icon-shadow, transparent)" />;
      })}

      {/* Offset shadow peeks out along the lower/right silhouette edges. */}
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === '.' ? null : (
            <rect
              key={`shadow-${x}-${y}`}
              x={x + 0.32}
              y={y + 0.32}
              width="1"
              height="1"
              fill="var(--pixel-icon-shadow, transparent)"
            />
          ),
        ),
      )}

      {/* Body and sparse top-edge highlights. Accent pixels become inner shadow/recess pixels. */}
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) => {
          if (cell === '.') return null;
          const isTopEdge = y === 0 || !visible(x, y - 1);
          const fill = isTopEdge
            ? `var(--pixel-icon-highlight, ${cell === 'o' ? accentColor : 'var(--wine)'})`
            : cell === 'o'
              ? `var(--pixel-icon-shadow, ${accentColor})`
              : 'var(--pixel-icon-base, var(--wine))';
          return <rect key={`pixel-${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />;
        }),
      )}
    </svg>
  );
}
