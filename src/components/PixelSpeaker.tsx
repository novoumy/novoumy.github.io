import { runs } from '@/lib/scale2x';

// 12x12 pixel-art speaker for the sound button: muted (x), quiet (one wave) or loud (two waves).
const BODY = [
  '............',
  '............',
  '.....#......',
  '....##......',
  '.#####......',
  '.#####......',
  '.#####......',
  '.#####......',
  '....##......',
  '.....#......',
  '............',
  '............',
];
const WAVE_1 = [(7, 4), (8, 5), (8, 6), (7, 7)];
const WAVE_2 = [(9, 2), (10, 3), (10, 4), (10, 5), (10, 6), (10, 7), (10, 8), (9, 9)];
const MUTE = [(7, 4), (8, 5), (9, 6), (10, 7), (10, 4), (9, 5), (8, 6), (7, 7)];

export type SpeakerLevel = 'muted' | 'low' | 'high';

function draw(level: SpeakerLevel): string[] {
  const grid = BODY.map((r) => r.split(''));
  const extra = level === 'muted' ? MUTE : level === 'low' ? WAVE_1 : [...WAVE_1, ...WAVE_2];
  for (const [x, y] of extra) grid[y][x] = '#';
  return grid.map((r) => r.join(''));
}

const CELLS: Record<SpeakerLevel, ReturnType<typeof runs>> = {
  muted: runs(draw('muted')),
  low: runs(draw('low')),
  high: runs(draw('high')),
};

export default function PixelSpeaker({ level, size = 24, className }: { level: SpeakerLevel; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} shapeRendering="crispEdges" fill="currentColor" aria-hidden="true" className={className}>
      {CELLS[level].map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height="1" />
      ))}
    </svg>
  );
}
