#!/usr/bin/env node
// Syncs your Steam library into a static JSON file the site can load with no API key.
//
//   STEAM_API_KEY=... STEAM_ID=... node scripts/sync-steam.mjs
//
// For every owned game it stores playtime + cover art URLs. For every game you have actually
// played it also stores the full achievement list (icon, name, description, unlocked + time).
// The GitHub Action in .github/workflows/sync-steam.yml runs this every 12 hours.
//
// Requirements on the Steam side: your profile AND "Game details" must be set to Public,
// otherwise Steam returns an empty library / no achievements.
//
// Only real games are kept. Software / utilities (Wallpaper Engine, Lossless Scaling, ...) are dropped,
// as is anything listed in src/data/steamFilter.json -> "blacklist" (titles or appids you never want).
// Steam's own store data (app type + genres) is used to spot software; results are cached in the output
// file (extras.appTypes) so each app is only looked up once.
//
// Optional env: STEAM_OUT (output path), STEAM_API_BASE / STEAM_STORE_BASE (for testing against a mock
// server), STEAM_FILTER (path to the filter file).

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const KEY = process.env.STEAM_API_KEY;
const STEAM_ID = process.env.STEAM_ID;
const API = (process.env.STEAM_API_BASE || 'https://api.steampowered.com').replace(/\/$/, '');
const STORE_API = (process.env.STEAM_STORE_BASE || 'https://store.steampowered.com').replace(/\/$/, '');
const OUT = process.env.STEAM_OUT || 'public/data/steam-games.json';
const FILTER_FILE = process.env.STEAM_FILTER || 'src/data/steamFilter.json';
const STORE_DELAY_MS = Number(process.env.STEAM_STORE_DELAY_MS ?? 1600); // store API allows ~200 requests / 5 min
// Store genre ids that mean "this is a program, not a game".
// 50 Accounting, 51 Animation & Modeling, 52 Audio Production, 53 Design & Illustration, 55 Photo Editing,
// 56 Video Production, 57 Utilities, 58 Web Publishing, 59 Game Development, 60 Software Training
const SOFTWARE_GENRE_IDS = new Set(['50', '51', '52', '53', '55', '56', '57', '58', '59', '60']);
const CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';
const CONCURRENCY = 6;
const IMAGE_OVERRIDES = {
  3527290: {
    capsule: 'https://shared.steamstatic.com/store_item_assets/steam/apps/3527290/31bac6b2eccf09b368f5e95ce510bae2baf3cfcd/header.jpg',
    header: 'https://shared.steamstatic.com/store_item_assets/steam/apps/3527290/31bac6b2eccf09b368f5e95ce510bae2baf3cfcd/header.jpg',
    hero: 'https://shared.steamstatic.com/store_item_assets/steam/apps/3527290/library_hero.jpg',
  },
  1912410: {
    capsule: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1912410/86cbba83c1aaffa0b0efa4197ce29c2264ea9dc2/header.jpg',
    header: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1912410/86cbba83c1aaffa0b0efa4197ce29c2264ea9dc2/header.jpg',
    hero: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1912410/dbbe1c377ecf00ed7c841bcdfa72c44853080d43/page_bg_raw.jpg',
  },
};

if (!KEY || !STEAM_ID) {
  console.error('Missing STEAM_API_KEY or STEAM_ID (add them as repository secrets).');
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// GET JSON with retries on rate limits / server errors. Returns { status, json }.
// 4xx answers other than 429 are returned as-is (Steam uses 400/403 for "no stats" / "private").
async function getJson(endpoint, params, { retries = 4 } = {}) {
  const url = `${API}/${endpoint}?${new URLSearchParams({ key: KEY, format: 'json', ...params })}`;
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { accept: 'application/json' } });
      if (response.status === 429 || response.status >= 500) throw new Error(`HTTP ${response.status}`);
      let json = null;
      try {
        json = await response.json();
      } catch {
        /* empty / non-JSON body */
      }
      return { status: response.status, json };
    } catch (error) {
      if (attempt >= retries) throw new Error(`${endpoint} failed: ${error.message}`);
      await sleep(1000 * 2 ** attempt);
    }
  }
}

// Steam's schema gives full icon URLs; the files all live in one folder, so keep only the file name
// (the site rebuilds the URL). Anything unexpected is stored untouched.
function shortIcon(url) {
  if (!url) return '';
  const match = /\/steamcommunity\/public\/images\/apps\/\d+\/([^/]+)$/.exec(url);
  return match ? match[1] : url;
}

async function fetchAchievements(appid) {
  const [player, schema] = await Promise.all([
    getJson('ISteamUserStats/GetPlayerAchievements/v1/', { steamid: STEAM_ID, appid, l: 'english' }),
    getJson('ISteamUserStats/GetSchemaForGame/v2/', { appid, l: 'english' }),
  ]);

  const mine = player.json?.playerstats;
  const playerList = mine?.success && Array.isArray(mine.achievements) ? mine.achievements : [];
  const schemaList = schema.json?.game?.availableGameStats?.achievements ?? [];
  if (playerList.length === 0 && schemaList.length === 0) return null; // game has no achievements (or private)

  const byId = new Map(playerList.map((entry) => [entry.apiname, entry]));
  const base = schemaList.length > 0 ? schemaList : playerList.map((entry) => ({ name: entry.apiname }));

  const list = base.map((item) => {
    const status = byId.get(item.name);
    const unlocked = status?.achieved === 1;
    return {
      id: item.name,
      name: item.displayName || status?.name || item.name,
      description: item.description || status?.description || '',
      hidden: item.hidden === 1,
      unlocked,
      unlockTime: unlocked ? status?.unlocktime || 0 : 0,
      icon: shortIcon(item.icon),
      iconGray: shortIcon(item.icongray),
    };
  });

  const unlocked = list.filter((item) => item.unlocked).length;
  const total = list.length;
  return { total, unlocked, percent: unlocked === total ? 100 : Math.floor((unlocked / total) * 100), list };
}

// ---- filtering: blacklist + "is this actually a game?" ---------------------------------------
// Same name matching as src/lib/steam.ts: ignore case, symbols like (TM)/(R), punctuation and spacing.
const normalizeName = (name) =>
  String(name ?? '')
    .replace(/[\u2122\u00ae\u00a9]/g, '') // before NFKD, which would turn the trademark sign into "TM"
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

async function readFilter() {
  try {
    const raw = JSON.parse(await readFile(FILTER_FILE, 'utf8'));
    const list = Array.isArray(raw.blacklist) ? raw.blacklist : [];
    return {
      blacklistIds: new Set(list.filter((entry) => typeof entry === 'number')),
      blacklistNames: new Set(list.filter((entry) => typeof entry === 'string').map(normalizeName)),
      nonGameIds: new Set((Array.isArray(raw.nonGameAppIds) ? raw.nonGameAppIds : []).map(Number)),
    };
  } catch (error) {
    console.warn(`Could not read ${FILTER_FILE} (${error.message}) - continuing without a blacklist.`);
    return { blacklistIds: new Set(), blacklistNames: new Set(), nonGameIds: new Set() };
  }
}

// Returns 'game' | 'software' | null (null = couldn't find out right now; the app is kept and retried next sync).
async function classifyApp(appid) {
  const url = `${STORE_API}/api/appdetails?${new URLSearchParams({ appids: String(appid), filters: 'basic,genres', l: 'english' })}`;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { accept: 'application/json' } });
      if (response.status === 429 || response.status >= 500) throw new Error(`HTTP ${response.status}`);
      if (!response.ok) return null;
      const entry = (await response.json())?.[appid];
      if (!entry) return null;
      // Delisted / region-locked apps have no store page. Nothing says they're software, so keep them.
      if (!entry.success || !entry.data) return 'game';
      const { type, genres } = entry.data;
      if (type && type !== 'game') return 'software'; // software, tool, dlc, demo, music, video, mod, ...
      if (Array.isArray(genres) && genres.some((genre) => SOFTWARE_GENRE_IDS.has(String(genre.id)))) return 'software';
      return 'game';
    } catch {
      await sleep(5000 * 2 ** attempt); // the store API rate-limits hard, back off
    }
  }
  return null;
}

async function readPrevious() {
  try {
    return JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    return { generatedAt: null, games: [] };
  }
}

async function main() {
  const previous = await readPrevious();
  const previousById = new Map(previous.games.map((game) => [game.appid, game]));

  const owned = await getJson('IPlayerService/GetOwnedGames/v1/', {
    steamid: STEAM_ID,
    include_appinfo: 1,
    include_played_free_games: 1,
  });
  const ownedGames = owned.json?.response?.games;
  if (owned.status !== 200 || !Array.isArray(ownedGames) || ownedGames.length === 0) {
    // Don't overwrite a good file with an empty one.
    console.error(
      `GetOwnedGames returned no games (HTTP ${owned.status}). Is the Steam profile + "Game details" public, and are the key/ID right?`,
    );
    process.exit(1);
  }
  console.log(`Owned apps: ${ownedGames.length}`);

  // 1) blacklist, 2) known software, 3) ask the Steam store what each remaining app really is.
  const filter = await readFilter();
  const appTypes = { ...(previous.extras?.appTypes ?? {}) }; // appid -> 'game' | 'software' (cache)
  const dropped = [];
  const candidates = [];
  for (const game of ownedGames) {
    const name = game.name || `App ${game.appid}`;
    if (filter.blacklistIds.has(game.appid) || filter.blacklistNames.has(normalizeName(name))) {
      dropped.push(`${name} (blacklisted)`);
    } else if (filter.nonGameIds.has(game.appid)) {
      dropped.push(`${name} (software)`);
    } else {
      candidates.push(game);
    }
  }
  const unknown = candidates.filter((game) => !appTypes[game.appid]);
  if (unknown.length > 0) console.log(`Checking ${unknown.length} new apps against the Steam store...`);
  for (const game of unknown) {
    const kind = await classifyApp(game.appid);
    if (kind) appTypes[game.appid] = kind;
    else console.warn(`  ? ${game.name} (${game.appid}): store lookup failed - keeping it, will retry next sync`);
    await sleep(STORE_DELAY_MS);
  }
  const keptApps = candidates.filter((game) => {
    if (appTypes[game.appid] !== 'software') return true;
    dropped.push(`${game.name || `App ${game.appid}`} (software)`);
    return false;
  });
  if (dropped.length > 0) console.log(`Ignored ${dropped.length}: ${dropped.join(', ')}`);

  const games = keptApps.map((game) => ({
    appid: game.appid,
    name: game.name || `App ${game.appid}`,
    playtimeMinutes: game.playtime_forever || 0,
    playtime2WeeksMinutes: game.playtime_2weeks || 0,
    lastPlayed: game.rtime_last_played || 0,
    images: IMAGE_OVERRIDES[game.appid] ?? {
      capsule: `${CDN}/${game.appid}/library_600x900.jpg`,
      header: `${CDN}/${game.appid}/header.jpg`,
      hero: `${CDN}/${game.appid}/library_hero.jpg`,
    },
    storeUrl: `https://store.steampowered.com/app/${game.appid}`,
    achievements: null,
  }));
  games.sort((a, b) => a.name.localeCompare(b.name, 'en') || a.appid - b.appid);

  // Achievements only for games that have been played, a few requests at a time.
  const played = games.filter((game) => game.playtimeMinutes > 0);
  console.log(`Fetching achievements for ${played.length} played games...`);
  let cursor = 0;
  let failures = 0;
  const worker = async () => {
    while (cursor < played.length) {
      const game = played[cursor++];
      try {
        game.achievements = await fetchAchievements(game.appid);
      } catch (error) {
        failures += 1;
        game.achievements = previousById.get(game.appid)?.achievements ?? null; // keep the last good data
        console.warn(`  ! ${game.name} (${game.appid}): ${error.message} - kept previous data`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    const previousBonus = Math.max(0, Number(previous.extras?.minecraftBonusHours ?? 0));
  const ownedIds = new Set(ownedGames.map((game) => String(game.appid)));
  const cleanTypes = Object.fromEntries(Object.entries(appTypes).filter(([id]) => ownedIds.has(id)));
  const extras = { ...(previous.extras ?? {}), minecraftBonusHours: previousBonus + 1, appTypes: cleanTypes };

  // Only touch the file when something real changed, so commits stay meaningful.
  const sameAsBefore =
    JSON.stringify(previous.games) === JSON.stringify(games) &&
    JSON.stringify(previous.extras ?? null) === JSON.stringify(extras);
  if (sameAsBefore) {
    console.log('No changes since the last sync.');
    return;
  }

  const body = `{"generatedAt":${JSON.stringify(new Date().toISOString())},"extras":${JSON.stringify(extras)},"games":[\n${games
    .map((game) => JSON.stringify(game))
    .join(',\n')}\n]}\n`;
  await mkdir(path.dirname(OUT), { recursive: true });
  const tmp = `${OUT}.tmp`;
  await writeFile(tmp, body);
  await rename(tmp, OUT);

  const withAch = games.filter((game) => game.achievements).length;
  console.log(`Wrote ${OUT}: ${games.length} games (${dropped.length} ignored), ${withAch} with achievements, ${failures} fetch failures, +1 Minecraft hour (${extras.minecraftBonusHours} total bonus).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
