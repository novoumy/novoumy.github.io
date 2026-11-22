import type { TabIconName } from '@/siteData';

// 24x24 pixel-art tab icons (solid, one colour). Every vertex sits on the 1px grid, so at size 24 each art pixel
// is exactly one device pixel (crisp). Colours come from currentColor, so each icon follows the tab's
// active / idle / hover palette.
//   user   -> MAIN       (person)
//   share  -> SOCIALS    (ringing phone)
//   grid   -> INTERESTS  (book with a heart)
//   cpu    -> SPECS      (chip)
// Each entry is a list of separate <path>s on purpose: the shapes were drawn as separate elements, and merging
// them into one path would let the fill rule punch holes where one shape sits inside another.
const GRID = 24;

const TAB_PATHS: Partial<Record<TabIconName, string[]>> = {
  user: [
    'M7 9 L6 9 L6 5 L7 5 L7 3 L8 3 L8 2 L10 2 L10 1 L14 1 L14 2 L16 2 L16 3 L17 3 L17 5 L18 5 L18 9 L17 9 L17 11 L16 11 L16 12 L14 12 L14 13 L10 13 L10 12 L8 12 L8 11 L7 11 L7 9Z',
    'M22 19 L22 22 L21 22 L21 23 L3 23 L3 22 L2 22 L2 19 L3 19 L3 18 L4 18 L4 17 L5 17 L5 16 L7 16 L7 15 L17 15 L17 16 L19 16 L19 17 L20 17 L20 18 L21 18 L21 19 L22 19Z',
  ],
  share: [
    'M12 7 L12 5 L15 5 L15 6 L16 6 L16 7 L17 7 L17 8 L18 8 L18 9 L19 9 L19 12 L17 12 L17 10 L16 10 L16 9 L15 9 L15 8 L14 8 L14 7 L12 7Z',
    'M12 10h2v2h-2z',
    'M23 8 L23 12 L21 12 L21 8 L20 8 L20 7 L19 7 L19 6 L18 6 L18 5 L17 5 L17 4 L16 4 L16 3 L12 3 L12 1 L16 1 L16 2 L18 2 L18 3 L19 3 L19 4 L20 4 L20 5 L21 5 L21 6 L22 6 L22 8 L23 8Z',
    'M22 17 L23 17 L23 20 L22 20 L22 22 L21 22 L21 23 L16 23 L16 22 L12 22 L12 21 L10 21 L10 20 L9 20 L9 19 L8 19 L8 18 L7 18 L7 17 L6 17 L6 16 L5 16 L5 15 L4 15 L4 14 L3 14 L3 12 L2 12 L2 8 L1 8 L1 3 L2 3 L2 2 L4 2 L4 1 L7 1 L7 2 L8 2 L8 3 L9 3 L9 5 L10 5 L10 8 L9 8 L9 9 L8 9 L8 12 L9 12 L9 13 L10 13 L10 14 L11 14 L11 15 L12 15 L12 16 L15 16 L15 15 L16 15 L16 14 L19 14 L19 15 L21 15 L21 16 L22 16 L22 17Z',
  ],
  grid: [
    'm21,17v-1h1V2h-1v-1H4v1h-1v1h-1v18h1v1h1v1h17v-1h1v-1h-1v-1h-1v-3h1Zm-3,4H6v-1h-1v-2h1v-1h12v4Zm0-12h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-3h1v-1h3v1h1v1h1v-1h1v-1h3v1h1v3Z',
  ],
  cpu: [
    'M17.5036 7.50146H7.50134V17.5037H17.5036V7.50146Z',
    'M21.5045 5.50091V3.50045H19.5041V1.5H17.5036V3.50045H15.5032V1.5H13.5027V3.50045H11.5023V1.5H9.50182V3.50045H7.50136V1.5H5.50091V3.50045H3.50045V5.50091H1.5V7.50136H3.50045V9.50182H1.5V11.5023H3.50045V13.5027H1.5V15.5032H3.50045V17.5036H1.5V19.5041H3.50045V21.5045H5.50091V23.505H7.50136V21.5045H9.50182V23.505H11.5023V21.5045H13.5027V23.505H15.5032V21.5045H17.5036V23.505H19.5041V21.5045H21.5045V19.5041H23.505V17.5036H21.5045V15.5032H23.505V13.5027H21.5045V11.5023H23.505V9.50182H21.5045V7.50136H23.505V5.50091H21.5045ZM19.5041 19.5041H5.50091V5.50091H19.5041V19.5041Z',
  ],
};

// specs.svg was exported half a pixel off the grid (edges at x.5); shifting it back puts every edge on a pixel line.
const TAB_SHIFT: Partial<Record<TabIconName, string>> = { cpu: 'translate(-0.5 -0.5)' };

interface PixelTabIconProps {
  name: TabIconName;
  size?: number;
  className?: string;
}

export default function PixelTabIcon({ name, size = 24, className }: PixelTabIconProps) {
  const paths = TAB_PATHS[name] ?? [];
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
      <g transform={TAB_SHIFT[name]}>
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}
