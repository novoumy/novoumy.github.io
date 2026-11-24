import type { TabIconName } from '@/siteData';
import { TAB_ICONS, TAB_ICON_GRID } from '@/lib/tabIcons';
import { centreRows, runs } from '@/lib/scale2x';

interface PixelTabIconProps {
  name: TabIconName;
  size?: number; // 24 = 2px per art pixel
  className?: string;
}

const CACHE = new Map<string, { x: number; y: number; w: number }[]>();

export default function PixelTabIcon({ name, size = 24, className }: PixelTabIconProps) {
  let cells = CACHE.get(name);
  if (!cells) {
    cells = runs(centreRows(TAB_ICONS[name] ?? [], TAB_ICON_GRID));
    CACHE.set(name, cells);
  }
  return (
    <svg
      viewBox={`0 0 ${TAB_ICON_GRID} ${TAB_ICON_GRID}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      {cells.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height="1" />
      ))}
    </svg>
  );
}
