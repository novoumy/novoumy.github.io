import { manualGames, type ManualGame } from '@/siteData';

// ---- shape of public/data/steam-games.json (written by scripts/sync-steam.mjs) ----------
export interface SteamAchievementRaw {
  id: string;
  name: string;
  description: string;
  hidden: boolean;
  unlocked: boolean;
  unlockTime: number; // unix seconds, 0 if locked
  icon: string; // file name inside Steam's icon folder (or a full URL)
  iconGray: string;
}

interface SteamGameRaw {
  appid: number;
  name: string;
  playtimeMinutes: number;
  playtime2WeeksMinutes: number;
  lastPlayed: number; // unix seconds, 0 = never
  images: { capsule: string; header: string; hero: string };
  storeUrl: string;
  achievements: { total: number; unlocked: number; percent: number; list: SteamAchievementRaw[] } | null;
}

interface SteamFile {
  generatedAt: string | null;
  games: SteamGameRaw[];
  extras?: {
    minecraftBonusHours?: number;
  };
}

// ---- what the UI works with: Steam games and manual entries in one shape -----------------
export interface Achievement extends SteamAchievementRaw {
  iconUrl: string;
  iconGrayUrl: string;
}

export interface LibraryGame {
  key: string;
  title: string;
  appid?: number;
  manual: boolean;
  covers: string[]; // tried in order until one loads
  heroes: string[];
  playtimeHours: number;
  playtimeLabel: string; // '142.5 HRS' / '3000+ HRS'
  lastPlayed: number; // unix seconds, 0 = unknown / never
  achievements: { total: number; unlocked: number; percent: number; list: Achievement[] } | null;
  url: string;
  urlLabel: string;
  note?: string;
  platforms?: string[];
}

export interface Library {
  games: LibraryGame[];
  syncedAt: string | null;
  steamCount: number;
}

const ICON_BASE = 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps';

const iconUrl = (appid: number, icon: string) =>
  !icon ? '' : /^https?:\/\//.test(icon) ? icon : `${ICON_BASE}/${appid}/${icon}`;

export function formatHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded.toLocaleString('en-US', { maximumFractionDigits: 1 })} HRS`;
}

const EXTRA_COVERS: Record<number, string[]> = {
  3527290: [
    'https://shared.steamstatic.com/store_item_assets/steam/apps/3527290/31bac6b2eccf09b368f5e95ce510bae2baf3cfcd/header.jpg',
    'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3527290/31bac6b2eccf09b368f5e95ce510bae2baf3cfcd/header.jpg',
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3527290/31bac6b2eccf09b368f5e95ce510bae2baf3cfcd/header.jpg',
    'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3527290/library_hero.jpg',
    'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3527290/1844964d7a353e50eb3cc979ea922729d8c1b0ad/capsule_231x87.jpg',
  ],
  1912410: [
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1912410/86cbba83c1aaffa0b0efa4197ce29c2264ea9dc2/header.jpg',
    'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1912410/86cbba83c1aaffa0b0efa4197ce29c2264ea9dc2/header.jpg',
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1912410/dbbe1c377ecf00ed7c841bcdfa72c44853080d43/page_bg_raw.jpg',
    'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1912410/dbbe1c377ecf00ed7c841bcdfa72c44853080d43/page_bg_raw.jpg',
  ],
};

function uniqueUrls(urls: Array<string | undefined | null>) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}

function fromSteam(game: SteamGameRaw): LibraryGame {
  const hours = game.playtimeMinutes / 60;
  const extra = EXTRA_COVERS[game.appid] ?? [];
  const generated = [
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_600x900_2x.jpg`,
    `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.appid}/library_600x900.jpg`,
    `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.appid}/library_600x900_2x.jpg`,
    `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.appid}/capsule_616x353.jpg`,
    `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg`,
  ];
  return {
    key: `steam-${game.appid}`,
    title: game.name,
    appid: game.appid,
    manual: false,
    covers: uniqueUrls([game.images.capsule, game.images.header, ...extra, ...generated]),
    heroes: uniqueUrls([game.images.hero, game.images.header, ...extra, ...generated]),
    playtimeHours: hours,
    playtimeLabel: formatHours(hours),
    lastPlayed: game.lastPlayed,
    achievements: game.achievements
      ? {
          ...game.achievements,
          list: game.achievements.list.map((item) => ({
            ...item,
            iconUrl: iconUrl(game.appid, item.icon),
            iconGrayUrl: iconUrl(game.appid, item.iconGray) || iconUrl(game.appid, item.icon),
          })),
        }
      : null,
    url: game.storeUrl,
    urlLabel: 'View on Steam store',
  };
}

function fromManual(game: ManualGame): LibraryGame {
  const list = game.achievements ?? [];
  const unlocked = list.filter((item) => item.unlocked).length;
  const achievements = game.achievements
    ? {
        total: list.length,
        unlocked,
        percent: list.length ? Math.round((unlocked / list.length) * 100) : 0,
        list: list.map((item) => {
          const icon = item.icon ?? '';
          const iconGray = item.iconGray ?? icon;
          return {
            ...item,
            unlockTime: item.unlockTime ?? 0,
            icon,
            iconGray,
            iconUrl: icon,
            iconGrayUrl: iconGray,
          };
        }),
      }
    : null;
  return {
    key: `manual-${game.title.toLowerCase().replace(/\W+/g, '-')}`,
    title: game.title,
    manual: true,
    covers: [game.cover],
    heroes: uniqueUrls([game.banner, game.cover]),
    playtimeHours: game.playtimeHours,
    playtimeLabel: game.playtimeLabel,
    lastPlayed: game.lastPlayed ?? 0,
    achievements,
    url: game.link,
    urlLabel: game.linkLabel,
    note: game.note,
    platforms: game.platforms,
  };
}

export function buildLibrary(file: SteamFile | null): Library {
  const bonusHours = Math.max(0, Number(file?.extras?.minecraftBonusHours ?? 0));
  const manual = manualGames.map((game) => {
    const entry = fromManual(game);
    if (game.title.toLowerCase() === 'minecraft' && bonusHours > 0) {
      const hours = game.playtimeHours + bonusHours;
      entry.playtimeHours = hours;
      entry.playtimeLabel = formatHours(hours);
    }
    return entry;
  });
  const manualTitles = new Set(manual.map((game) => game.title.toLowerCase()));
  // A manual entry wins over a Steam game with the same name.
  const steam = (file?.games ?? []).filter((game) => !manualTitles.has(game.name.toLowerCase())).map(fromSteam);
  return { games: [...manual, ...steam], syncedAt: file?.generatedAt ?? null, steamCount: steam.length };
}

let cached: Promise<Library> | null = null;

// The Steam library is synced by the GitHub Action in the novoumy/novoumy.github.io repository
// (scripts/sync-steam.mjs, every 12 hours). The site reads that committed file straight from GitHub,
// so new syncs show up without republishing, and no API key ever reaches the browser.
const STEAM_FILE_URLS = [
  'https://raw.githubusercontent.com/novoumy/novoumy.github.io/main/public/data/steam-games.json',
  'https://novoumy.github.io/data/steam-games.json',
];

async function fetchSteamFile(): Promise<SteamFile | null> {
  for (const url of STEAM_FILE_URLS) {
    try {
      const response = await fetch(url);
      if (response.ok) return (await response.json()) as SteamFile;
    } catch {
      // try the next source
    }
  }
  return null;
}

// Loaded once per page visit.
export function loadLibrary(): Promise<Library> {
  cached ??= fetchSteamFile().then(buildLibrary);
  return cached;
}

// ---- library maths -----------------------------------------------------------------------
export type FilterKey = 'all' | 'completed' | 'progress' | 'unplayed';

export const isCompleted = (game: LibraryGame) => !!game.achievements && game.achievements.total > 0 && game.achievements.unlocked === game.achievements.total;
export const isUnplayed = (game: LibraryGame) => !game.manual && game.playtimeHours <= 0.3;

export function matchesFilter(game: LibraryGame, filter: FilterKey): boolean {
  if (filter === 'completed') return isCompleted(game);
  if (filter === 'unplayed') return isUnplayed(game);
  if (filter === 'progress') return !isCompleted(game) && !isUnplayed(game);
  return true;
}

export function libraryStats(games: LibraryGame[]) {
  let hours = 0;
  let unlocked = 0;
  let total = 0;
  let approximate = false;
  for (const game of games) {
    hours += game.playtimeHours;
    if (game.manual && game.playtimeLabel.includes('+')) approximate = true;
    if (game.achievements) {
      unlocked += game.achievements.unlocked;
      total += game.achievements.total;
    }
  }
  return { count: games.length, hours, approximate, unlocked, total };
}

export function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
