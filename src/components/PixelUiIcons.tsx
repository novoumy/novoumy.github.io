import type { CSSProperties } from 'react';

// Pixel-art replacements for the lucide icons the site used to import: every icon is drawn on a small grid of
// square cells with shape-rendering: crispEdges, so there are no smooth curves or anti-aliased diagonals anywhere.
// The props mirror lucide's (size, className, ...); strokeWidth is accepted and ignored.
interface PixelUiIconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
  'aria-hidden'?: boolean | 'true' | 'false';
}

function makeIcon(rows: string[]) {
  const w = rows[0].length;
  const h = rows.length;
  const cells = rows.flatMap((row, y) => {
    const out: { x: number; y: number; w: number }[] = [];
    let x = 0;
    while (x < row.length) {
      if (row[x] === '#') {
        let end = x + 1;
        while (end < row.length && row[end] === '#') end++;
        out.push({ x, y, w: end - x });
        x = end;
      } else x++;
    }
    return out;
  });
  return function PixelUiIcon({ size = 16, className, style, 'aria-hidden': ariaHidden = true }: PixelUiIconProps) {
    return (
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={(size * w) / Math.max(w, h)}
        height={(size * h) / Math.max(w, h)}
        shapeRendering="crispEdges"
        fill="currentColor"
        aria-hidden={ariaHidden}
        className={className}
        style={{ flex: 'none', ...style }}
      >
        {cells.map((c) => (
          <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={c.w} height="1" />
        ))}
      </svg>
    );
  };
}

// Symmetrical about the arrow's own diagonal: a solid corner head, a single-pixel shaft.
export const ArrowUpRight = makeIcon([
  '..#####',
  '...####',
  '....###',
  '...#.##',
  '..#...#',
  '.#.....',
  '#......',
]);

export const ArrowLeft = makeIcon([
  '....#....',
  '...##....',
  '..###....',
  '.########',
  '#########',
  '.########',
  '..###....',
  '...##....',
  '....#....',
]);

export const Check = makeIcon([
  '........##',
  '.......###',
  '##....###.',
  '###..###..',
  '.######...',
  '..####....',
  '...##.....',
]);

export const Copy = makeIcon([
  '#######...',
  '#.....#...',
  '#.....#...',
  '#..#######',
  '#..#.....#',
  '#..#.....#',
  '####.....#',
  '...#.....#',
  '...#.....#',
  '...#######',
]);

export const X = makeIcon([
  '##....##',
  '###..###',
  '.######.',
  '..####..',
  '..####..',
  '.######.',
  '###..###',
  '##....##',
]);

export const Search = makeIcon([
  '..####...',
  '.##..##..',
  '##....##.',
  '##....##.',
  '##....##.',
  '.##..##..',
  '..####.#.',
  '.......##',
  '........#',
]);

export const ChevronDown = makeIcon([
  '##....##',
  '.##..##.',
  '..####..',
  '...##...',
]);

export const SlidersHorizontal = makeIcon([
  '......##..',
  '##########',
  '......##..',
  '..##......',
  '##########',
  '..##......',
  '.....##...',
  '##########',
  '.....##...',
]);

export const FileText = makeIcon([
  '#####...',
  '#...##..',
  '#...###.',
  '#.....#.',
  '#.###.#.',
  '#.....#.',
  '#.###.#.',
  '#.....#.',
  '#######.',
]);

export const Headphones = makeIcon([
  '..######..',
  '.##....##.',
  '##......##',
  '#........#',
  '#........#',
  '###....###',
  '###....###',
  '###....###',
  '.#......#.',
]);

export const Youtube = makeIcon([
  '.########.',
  '##########',
  '###.######',
  '###..#####',
  '###...####',
  '###..#####',
  '###.######',
  '.########.',
]);

export const ExternalLink = ArrowUpRight;
