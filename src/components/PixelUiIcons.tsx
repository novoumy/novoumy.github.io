import type { CSSProperties } from 'react';
import { pathData } from '@/lib/pixelPaths';

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
  const width = rows[0].length;
  const height = rows.length;
  const path = pathData(rows, '#');
  return function PixelUiIcon({ size = 16, className, style, 'aria-hidden': ariaHidden = true }: PixelUiIconProps) {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={(size * width) / Math.max(width, height)}
        height={(size * height) / Math.max(width, height)}
        shapeRendering="crispEdges"
        fill="currentColor"
        aria-hidden={ariaHidden}
        focusable="false"
        className={className}
        style={{ flex: 'none', ...style }}
      >
        <path d={path} />
      </svg>
    );
  };
}

// Smooth rounded up-right arrow (stroked, round caps/joins) used on link tiles and the Write button.
export function ArrowUpRight({ size = 16, className, style, 'aria-hidden': ariaHidden = true }: PixelUiIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      focusable="false"
      className={className}
      style={{ flex: 'none', ...style }}
    >
      <path d="M6 18 18 6M8.5 6H18v9.5" />
    </svg>
  );
}

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

// Tiny toolbar marks stay on compact hand-drawn grids: these controls render at 12–16px,
// below the 24px base grid that the shared library is designed to scale from.
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
