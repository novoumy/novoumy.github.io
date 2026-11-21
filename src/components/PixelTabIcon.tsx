import type { TabIconName } from '@/siteData';

// 10x10 pixel-art tab icons. '#' = filled pixel, '.' = empty. They draw in currentColor so they
// follow the tab's active / inactive / hover colours exactly like the old vector icons did.
const GRID = 10;
const TAB_PIXELS: Record<TabIconName, string[]> = {
  // person: head + shoulders
  user: [
    '..........',
    '...####...',
    '..######..',
    '..######..',
    '...####...',
    '..........',
    '.########.',
    '##########',
    '##########',
    '..........',
  ],
  // share: three nodes joined by lines
  share: [
    '.......##.',
    '.......##.',
    '....###...',
    '..###.....',
    '.##.......',
    '.##.......',
    '..###.....',
    '....###...',
    '.......##.',
    '.......##.',
  ],
  // grid: 2x2 tiles
  grid: [
    '..........',
    '.####.####',
    '.####.####',
    '.####.####',
    '.####.####',
    '..........',
    '.####.####',
    '.####.####',
    '.####.####',
    '.####.####',
  ],
  // cpu chip with pins
  cpu: [
    '..#.#.#...',
    '.########.',
    '.########.',
    '##########',
    '.##....##.',
    '##.....###',
    '.##....##.',
    '.########.',
    '.########.',
    '..#.#.#...',
  ],
  film: [
    '..........',
    '##########',
    '#.#....#.#',
    '##########',
    '#.#....#.#',
    '#.#....#.#',
    '##########',
    '#.#....#.#',
    '##########',
    '..........',
  ],
  gamepad: [
    '..........',
    '..........',
    '.########.',
    '##########',
    '#.#####.##',
    '###.###.##',
    '#.#####.##',
    '##########',
    '.##....##.',
    '..........',
  ],
  music: [
    '..........',
    '...######.',
    '...######.',
    '...#....#.',
    '...#....#.',
    '...#....#.',
    '.###..###.',
    '.###..###.',
    '..........',
    '..........',
  ],
  quote: [
    '..........',
    '.###.###..',
    '#####.####',
    '#####.####',
    '#####.####',
    '.###..###.',
    '..#....#..',
    '.#....#...',
    '..........',
    '..........',
  ],
};

interface PixelTabIconProps {
  name: TabIconName;
  size?: number;
  className?: string;
}

export default function PixelTabIcon({ name, size = 20, className }: PixelTabIconProps) {
  const rows = TAB_PIXELS[name] ?? [];
  // One merged path keeps hundreds of <rect>s out of the DOM and avoids hairline seams between pixels.
  const d = rows
    .flatMap((row, y) => [...row].map((cell, x) => (cell === '#' ? `M${x} ${y}h1v1h-1z` : '')))
    .join('');
  return (
    <svg
      viewBox={`0 0 ${GRID} ${GRID}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <path d={d} />
    </svg>
  );
}
