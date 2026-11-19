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
// Optional env: STEAM_OUT (output path), STEAM_API_BASE (for testing against a mock server).

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const KEY = process.env.STEAM_API_KEY;
const STEAM_ID = process.env.STEAM_ID;
const API = (process.env.STEAM_API_BASE || 'https://api.steampowered.com').replace(/\/$/, '');
const OUT = process.env.STEAM_OUT || 'public/data/steam-games.json';
const CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';
const CONCURRENCY = 6;

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
  console.log(`Owned games: ${ownedGames.length}`);

  const games = ownedGames.map((game) => ({
    appid: game.appid,
    name: game.name || `App ${game.appid}`,
    playtimeMinutes: game.playtime_forever || 0,
    playtime2WeeksMinutes: game.playtime_2weeks || 0,
    lastPlayed: game.rtime_last_played || 0,
    images: {
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
  const extras = { ...(previous.extras ?? {}), minecraftBonusHours: previousBonus + 1 };

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
  console.log(`Wrote ${OUT}: ${games.length} games, ${withAch} with achievements, ${failures} fetch failures, +1 Minecraft hour (${extras.minecraftBonusHours} total bonus).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
