import type { TabIconName } from '@/siteData';

// 12x12 pixel-art tab icons, drawn on an exact 2x grid (24px) so every pixel is a crisp 2x2 block.
//   '#' = solid pixel (currentColor), 'o' = shade pixel (currentColor at reduced opacity),
//   '.' = empty (shows the tab background, which is how details like windows and doors are cut out).
// Colours come from currentColor, so each icon follows the tab's active / idle / hover palette.
const GRID = 12;
const SHADE_OPACITY = 0.5;

const TAB_PIXELS: Partial<Record<TabIconName, string[]>> = {
  // MAIN: little house with chimney, windows and a door
  user: [
    '............',
    '.....##..##.',
    '....####.##.',
    '...######.#.',
    '..########..',
    '.##########.',
    '############',
    '.##o####o##.',
    '.##o####o##.',
    '.####..####.',
    '.####..####.',
    '.####..####.',
  ],
  // SOCIALS: chat bubble with a typing ellipsis
  share: [
    '............',
    '.##########.',
    '############',
    '##.##.##.###',
    '##.##.##.###',
    '############',
    '############',
    '.##########.',
    '..####oo....',
    '..###.......',
    '..##........',
    '..#.........',
  ],
  // INTERESTS: favourite star
  grid: [
    '.....##.....',
    '.....##.....',
    '....####....',
    '############',
    '.##########.',
    '..########..',
    '...######...',
    '..########..',
    '..###oo###..',
    '.###....###.',
    '.##......##.',
    '............',
  ],
  // SPECS: CPU chip with pins and a die
  cpu: [
    '...#.##.#...',
    '...#.##.#...',
    '..########..',
    '#.########.#',
    '..##....##..',
    '#.##.oo.##.#',
    '#.##.oo.##.#',
    '..##....##..',
    '#.########.#',
    '..########..',
    '...#.##.#...',
    '...#.##.#...',
  ],
};

interface PixelTabIconProps {
  name: TabIconName;
  size?: number;
  className?: string;
}

const pathFor = (rows: string[], mark: string) =>
  rows
    .flatMap((row, y) => [...row].map((cell, x) => (cell === mark ? `M${x} ${y}h1v1h-1z` : '')))
    .join('');

export default function PixelTabIcon({ name, size = 24, className }: PixelTabIconProps) {
  const rows = TAB_PIXELS[name] ?? [];
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
      <path d={pathFor(rows, '#')} />
      <path d={pathFor(rows, 'o')} opacity={SHADE_OPACITY} />
    </svg>
  );
}
