/*
 * ============================================================================
 *  SITE CONTENT - edit everything on the website from this one file.
 * ============================================================================
 *  - Text, links, images and tab names all live here. Change the strings
 *    between quotes, add items by copying an existing entry, remove items by
 *    deleting their block, reorder by moving blocks up or down.
 *  - Images: paste any image URL (https://...) into the "image", "poster",
 *    "cover" or "avatar" fields.
 *  - Tabs: set "enabled: false" to hide a tab. Change "label" to rename it.
 *    The first enabled tab in the list is the one shown when the site loads.
 *  - Keep commas between entries and quotes around text, just like a list.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// Types (the shapes each section expects - you normally don't need to touch these)
// ----------------------------------------------------------------------------

export type TabId = 'main' | 'media' | 'games' | 'music' | 'quotes' | 'socials';

// Built-in icons available for tabs. Options: 'user' | 'film' | 'gamepad' | 'music' | 'quote' | 'share'
export type TabIconName = 'user' | 'film' | 'gamepad' | 'music' | 'quote' | 'share';

// Built-in icons available for social tiles (used when no "image" is given).
// Options: 'github' | 'youtube' | 'x' | 'discord' | 'steam' | 'instagram' | 'linkedin' | 'globe' | 'mail'
export type SocialIconName =
  | 'github'
  | 'youtube'
  | 'x'
  | 'discord'
  | 'steam'
  | 'instagram'
  | 'linkedin'
  | 'globe'
  | 'mail';

export type MediaCategory = 'Movie' | 'Anime' | 'Show';

export interface TabConfig {
  id: TabId;
  label: string;
  icon: TabIconName;
  enabled: boolean;
}

export interface HeroBadge {
  label: string;
  value: string;
}

export interface MediaItem {
  title: string;
  category: MediaCategory;
  rating: number; // out of 10, e.g. 9.5
  poster: string;
  review: string; // your personal notes, shown when the card is opened
  link: string; // external page (IMDb, MyAnimeList...), opened from the expanded card
  linkLabel: string; // button text, e.g. 'IMDb' or 'MyAnimeList'
}

export interface GameItem {
  title: string;
  status: string; // shown in the badge, e.g. 'Completed', 'Playing', '100%'
  note: string; // one short line
  cover: string;
  link?: string; // optional Steam / store link
}

export interface TrackItem {
  title: string;
  artist: string;
  cover: string;
  link: string;
  linkLabel: string; // e.g. 'Spotify', 'YouTube', 'SoundCloud'
}

export interface QuoteItem {
  text: string;
  author: string;
}

export interface SocialItem {
  platform: string; // e.g. 'Discord'
  handle: string; // e.g. '@novomee'
  url: string;
  icon?: SocialIconName; // built-in pixel icon...
  image?: string; // ...or your own image URL (takes priority over icon)
}

// ----------------------------------------------------------------------------
// Site-wide settings
// ----------------------------------------------------------------------------

export const site = {
  // Shown in the browser tab.
  title: "novoumy",
};

// ----------------------------------------------------------------------------
// Audio
// ----------------------------------------------------------------------------

export const audio = {
  // Looping background music. Put your MP3 in the "public/audio" folder and
  // keep this path, or point it at any other MP3 URL.
  bgmSrc: '/audio/bgm.mp3',
  // 0 = silent, 1 = full volume.
  bgmVolume: 0.35,
};

// ----------------------------------------------------------------------------
// Tabs - order here is the order on screen
// ----------------------------------------------------------------------------

export const tabs: TabConfig[] = [
  { id: 'main', label: 'Main', icon: 'user', enabled: true },
  { id: 'media', label: 'Media', icon: 'film', enabled: true },
  { id: 'games', label: 'Games', icon: 'gamepad', enabled: true },
  { id: 'music', label: 'Music', icon: 'music', enabled: true },
  { id: 'quotes', label: 'Quotes', icon: 'quote', enabled: true },
  { id: 'socials', label: 'Socials', icon: 'share', enabled: true },
];

// ----------------------------------------------------------------------------
// 1. MAIN - profile hero
// ----------------------------------------------------------------------------

export const hero = {
  avatar:
    '/icon.png',
  avatarAlt: 'Profile photo',
  name: 'novoumy',
  // Each entry is one paragraph of the bio.
  bio: [
    'Hi. I\'m a student and I like minecarft and many other things!',
  ],
  // Exactly three status boxes, shown left, middle, right along the bottom.
  badges: [
    { label: 'Status', value: 'studying..' },
    { label: 'Current Vibe', value: 'relaxed' },
    { label: 'Location', value: 'Somewhere blue' },
  ] as HeroBadge[],
};

// ----------------------------------------------------------------------------
// 2. MEDIA - movies, anime and shows
// ----------------------------------------------------------------------------

// Filter bar buttons. "value" must be 'all' or one of the categories above.
export const mediaFilters: { label: string; value: 'all' | MediaCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'Movie' },
  { label: 'Anime', value: 'Anime' },
  { label: 'Shows', value: 'Show' },
];

export const media: MediaItem[] = [
  {
    title: 'Attack on titan',
    category: 'Anime',
    rating: 9.9,
    poster:
      'https://m.media-amazon.com/images/M/MV5BZjliODY5MzQtMmViZC00MTZmLWFhMWMtMjMwM2I3OGY1MTRiXkEyXkFqcGc@._V1_FMjpg_UX850_.jpg',
    link: 'https://www.imdb.com/title/tt2560140/',
    linkLabel: 'IMDb',
    review: 'Ive watched it like 4 times.. Its just so good and perfect ahh.. my favs is hange zoe and sasha',
  },
  {
    title: 'Interstellar',
    category: 'Movie',
    rating: 9.8,
    poster:
      'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UY3600_.jpg',
    link: 'https://www.imdb.com/title/tt0816692/',
    linkLabel: 'IMDb',
    review: 'space = cool :3',
  },
];

// ----------------------------------------------------------------------------
// 3. GAMES - library / inventory list
// ----------------------------------------------------------------------------

export const games: GameItem[] = [
  {
    title: 'Minecraft',
    status: 'forever playing',
    note: 'just perfect.',
    cover:
      'https://cdn2.steamgriddb.com/thumb/a73027901f88055aaa0fd1a9e25d36c7.jpg',
  },
  {
    title: 'Hollow Knight',
    status: '40%',
    note: 'Beautiful and hard as fuck',
    cover:
      'https://cdn2.steamgriddb.com/thumb/d18c832e8c956b4ef8b92862e6bf470d.jpg',
    link: 'https://store.steampowered.com/app/367520/',
  },
];

// ----------------------------------------------------------------------------
// 4. MUSIC - retro player list
// ----------------------------------------------------------------------------

export const tracks: TrackItem[] = [
  {
    title: 'My Love Mine All Mine',
    artist: 'Mitski',
    cover:
      'https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2F485597d10bafde06faa87e527be1324d.1000x1000x1.png',
    link: 'https://www.youtube.com/watch?v=CwGbMYLjIpQ',
    linkLabel: 'YouTube',
  },
];

// ----------------------------------------------------------------------------
// 5. QUOTES - dialogue boxes
// ----------------------------------------------------------------------------

export const quotes: QuoteItem[] = [
  {
    text: 'The world is cruel… and yet… so very beautiful.',
    author: 'Mikasa Ackerman',
  },
  {
    text: 'I am victim of my own conscience constantly feeling guilty for things I have not done.',
    author: 'Franz Kafka',
  },
];

// ----------------------------------------------------------------------------
// 6. SOCIALS - link tiles
// ----------------------------------------------------------------------------

export const socials: SocialItem[] = [
  {
    platform: 'Discord',
    handle: 'novoumy',
    url: 'https://discord.com/users/722546564685365419',
    icon: 'discord',
  },
  {
    platform: 'Steam',
    handle: 'novoumy',
    url: 'https://steamcommunity.com/id/novoumy/',
    icon: 'steam',
  },
  // Example of a custom image instead of a built-in icon:
  // { platform: 'Blog', handle: 'novomee.dev', url: 'https://example.com', image: 'https://.../logo.png' },
];
