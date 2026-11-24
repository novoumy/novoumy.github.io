import { memo, type ComponentType, type SVGProps } from 'react';
import {
  CommentText,
  QuoteTextInline,
  Cpu,
  Discord,
  Facebook,
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

const CUSTOM_ALIASES: Record<string, string> = { namemc: 'minecraft-filled' };

function customPath(name: string): string {
  const sourceName = CUSTOM_ALIASES[name] ?? name;
  let path = CUSTOM_PATHS.get(sourceName);
  if (path === undefined) {
    const rows = CUSTOM_PIXEL_ICONS[sourceName];
    path = rows ? pathData(normalizeTo24(rows), '#') : '';
    CUSTOM_PATHS.set(sourceName, path);
  }
  return path;
}

function FacebookCircle({ className }: { className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 ${className ?? ''}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" shapeRendering="crispEdges" className="absolute inset-0">
        <path
          d="M12 1h3v1h3v2h2v3h2v10h-2v3h-2v2h-3v1H9v-1H6v-2H4v-3H2V7h2V4h2V2h3V1h3z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="miter"
        />
      </svg>
      <Facebook width="64%" height="64%" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
    </span>
  );
}

interface PixelIconProps {
  name: string;
  size?: number;
  className?: string;
}

function PixelIcon({ name, size = 24, className }: PixelIconProps) {
  if (name === 'facebook') return <FacebookCircle className={className} />;

  // Original atom-orbit mark for Roblox: simple geometry on the same 24px grid.
  if (name === 'roblox' || name === 'atom') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <ellipse cx="12" cy="12" rx="9.5" ry="3.9" />
        <ellipse cx="12" cy="12" rx="9.5" ry="3.9" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9.5" ry="3.9" transform="rotate(120 12 12)" />
        <rect x="10.5" y="10.5" width="3" height="3" fill="currentColor" stroke="none" />
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
