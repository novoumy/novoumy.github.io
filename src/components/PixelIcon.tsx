import { memo, type ComponentType, type SVGProps } from 'react';
import {
  CommentText,
  QuoteTextInline,
  Cpu,
  Discord,
  Gamepad,
  Globe,
  Gpu,
  Headphone,
  Image as ImageIcon,
  Instagram,
  Keyboard,
  Linkedin,
  Mail,
  Mic,
  Mouse,
  Music,
  PcCase,
  Save,
  Smartphone,
  Tablet,
  Tv,
  User,
  X as XIcon,
  Youtube,
  CircuitBoard,
  Github,
} from 'pixelarticons/react';
import { CUSTOM_PIXEL_ICONS } from '@/lib/customPixelIcons';
import { pathData } from '@/lib/pixelPaths';

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * One icon registry for navigation, social links, interests and PC specs.
 * Library icons use Pixelarticons' native 24×24 grid and currentColor fill.
 * A small set of original pixel sprites fills genuine gaps in the free set.
 */
const PIXELARTICONS: Record<string, SvgIcon> = {
  // Main navigation
  user: User,
  main: User,
  'comment-text': CommentText,
  socials: CommentText,
  save: Save,
  interests: Save,
  cpu: Cpu,
  specs: Cpu,

  // Interests folders and overlay accents
  image: ImageIcon,
  media: ImageIcon,
  gamepad: Gamepad,
  games: Gamepad,
  music: Music,
  quote: QuoteTextInline,
  quotes: QuoteTextInline,

  // Social platforms
  discord: Discord,
  github: Github,
  instagram: Instagram,
  linkedin: Linkedin,
  mail: Mail,
  globe: Globe,
  x: XIcon,
  youtube: Youtube,

  // PC specifications and peripherals
  gpu: Gpu,
  mobo: CircuitBoard,
  case: PcCase,
  monitor: Tv,
  keyboard: Keyboard,
  mouse: Mouse,
  mic: Mic,
  phone: Smartphone,
  tablet: Tablet,
  earbuds: Headphone,
  controller: Gamepad,
  headphone: Headphone,
};

const GRID_SIZE = 24;
const CUSTOM_PATHS = new Map<string, string>();

// Trace-derived SVG paths are prepared once, not rebuilt on each Socials render.
const USER_REFERENCE_ICONS: Record<string, { viewBox: string; color: string; path: string }> = {
  pinterest: { viewBox: '0 0 13 14', color: '#3A2272', path: pathData(CUSTOM_PIXEL_ICONS.pinterest, '#') },
  namemc: { viewBox: '0 0 6 6', color: '#3A2272', path: pathData(CUSTOM_PIXEL_ICONS.namemc, '#') },
  snapchat: { viewBox: '0 0 10 10', color: '#0D0F15', path: pathData(CUSTOM_PIXEL_ICONS.snapchat, '#') },
  steam: { viewBox: '0 0 12 12', color: '#000000', path: pathData(CUSTOM_PIXEL_ICONS.steam, '#') },
};

function normalizeTo24(rows: string[]): string[] {
  const height = rows.length;
  const width = rows[0]?.length ?? 0;
  return Array.from({ length: GRID_SIZE }, (_, y) =>
    Array.from({ length: GRID_SIZE }, (_, x) => {
      const source = rows[Math.floor((y * height) / GRID_SIZE)]?.[Math.floor((x * width) / GRID_SIZE)];
      return source === '#' ? '#' : '.';
    }).join(''),
  );
}

function customPath(name: string): string {
  let path = CUSTOM_PATHS.get(name);
  if (path === undefined) {
    const rows = CUSTOM_PIXEL_ICONS[name];
    path = rows ? pathData(normalizeTo24(rows), '#') : '';
    CUSTOM_PATHS.set(name, path);
  }
  return path;
}

interface PixelIconProps {
  name: string;
  size?: number;
  className?: string;
}

function PixelIcon({ name, size = 24, className }: PixelIconProps) {
  // Exact Facebook mark supplied by the site owner.
  if (name === 'facebook') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d="M11 12H8v2h3v6h2v-6h4v-2h-4V6h4V4h-4V2h6v6h-4v2h4v6h-4v6H9v-6H6v-6h3V6h2v6Zm2-6h-2V4h2v2Z" />
      </svg>
    );
  }

  // Exact Roblox mark supplied for the Roblox social tile.
  if (name === 'roblox' || name === 'atom') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d="M20 20H4V4H20V20ZM10 14H14V10H10V14Z" />
      </svg>
    );
  }

  // Exact pixel-art Socials navigation mark supplied by the site owner.
  if (name === 'comment-text' || name === 'socials') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d="M21 22h-9v-2h9v2Zm-9-2h-2v-2h2v2Zm11 0h-2v-5h2v5Zm-13-2H8v-2h2v2Zm7-1h-4v-2h4v2Zm-9-1H6v-2h2v2Zm5-1h-2v-2h2v2Zm8 0h-4v-2h4v2ZM6 14H4v-2h2v2Zm5-1H9v-2h2v2Zm-7-1H2V3h2v9Zm5-1H7V7h2v4Zm9 0h-2V8h2v3Zm4 0h-2V6h2v5Zm-6-3h-3V6h3v2Zm-5-1H9V3h2v4Zm9-1h-2V4h2v2Zm-2-2h-5V2h5v2ZM9 3H4V1h5v2Z" />
      </svg>
    );
  }

  // User-supplied Socials artwork, traced to crisp SVG paths with no background.
  const referenceIcon = USER_REFERENCE_ICONS[name];
  if (referenceIcon) {
    return (
      <svg
        viewBox={referenceIcon.viewBox}
        width={size}
        height={size}
        fill={referenceIcon.color}
        shapeRendering="crispEdges"
        aria-hidden="true"
        className={className}
        focusable="false"
      >
        <path d={referenceIcon.path} />
      </svg>
    );
  }

  const LibraryIcon = PIXELARTICONS[name];
  if (LibraryIcon) {
    return <LibraryIcon width={size} height={size} className={className} aria-hidden="true" shapeRendering="crispEdges" />;
  }

  const path = customPath(name);
  if (!path) return <User width={size} height={size} className={className} aria-hidden="true" shapeRendering="crispEdges" />;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
      focusable="false"
    >
      <path d={path} />
    </svg>
  );
}

export default memo(PixelIcon);
