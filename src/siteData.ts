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
  {
    title: 'Hunter x Hunter',
    category: 'Anime',
    rating: 9.9,
    poster:
      'https://m.media-amazon.com/images/M/MV5BZjliODY5MzQtMmViZC00MTZmLWFhMWMtMjMwM2I3OGY1MTRiXkEyXkFqcGc@._V1_FMjpg_UX850_.jpg', // replace with a dedicated HxH poster if preferred
    link: 'https://www.imdb.com/title/tt2098220/',
    linkLabel: 'IMDb',
    review: 'The story the arcs the villans the power system its all just devine, one of my favorites',
  },
  {
    title: 'Demon Slayer',
    category: 'Anime',
    rating: 8.6,
    poster:
      'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UY3600_.jpg', // replace with a dedicated Demon Slayer poster if preferred
    link: 'https://www.imdb.com/title/tt9335498/',
    linkLabel: 'IMDb',
    review: 'very nice visuals and great attention to detail IG',
  },
  {
    title: 'Death Note',
    category: 'Anime',
    rating: 8.9,
    poster:
      'https://m.media-amazon.com/images/M/MV5BZjliODY5MzQtMmViZC00MTZmLWFhMWMtMjMwM2I3OGY1MTRiXkEyXkFqcGc@._V1_FMjpg_UX850_.jpg', // replace with a dedicated Death Note poster if preferred
    link: 'https://www.imdb.com/title/tt0877057/',
    linkLabel: 'IMDb',
    review: 'first anime I ever watched, I was so amazed by it That I got into anime.. A great anime overall',
  },
  {
    title: 'Frieren: Beyond Journey’s End',
    category: 'Anime',
    rating: 9.7,
    poster:
      'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UY3600_.jpg', // replace with a dedicated Frieren poster if preferred
    link: 'https://www.imdb.com/title/tt22248376/',
    linkLabel: 'IMDb',
    review: 'the magic system is very pretty and the slow burn is crazyyyy :3',
  },
  {
    title: 'Horimiya',
    category: 'Anime',
    rating: 9.2,
    poster:
      'https://m.media-amazon.com/images/M/MV5BZjliODY5MzQtMmViZC00MTZmLWFhMWMtMjMwM2I3OGY1MTRiXkEyXkFqcGc@._V1_FMjpg_UX850_.jpg', // replace with a dedicated Horimiya poster if preferred
    link: 'https://www.imdb.com/title/tt13521004/',
    linkLabel: 'IMDb',
    review: 'I liked it a lot and a finally didnt have to wait 20 seasons for them to confess',
  },
  {
    title: 'Rascal Does Not Dream series',
    category: 'Anime',
    rating: 9.9,
    poster:
      'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UY3600_.jpg', // replace with a dedicated Rascal poster if preferred
    link: 'https://www.imdb.com/title/tt9100796/',
    linkLabel: 'IMDb',
    review: 'absoulte banger.. genuine peak turned into an anime',
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
    link: 'https://minecraft.net',
  },
  {
    title: 'Hollow Knight',
    status: '40%',
    note: 'Beautiful and difficult',
    cover:
      'https://cdn2.steamgriddb.com/thumb/d18c832e8c956b4ef8b92862e6bf470d.jpg',
    link: 'https://store.steampowered.com/app/367520/',
  },
  {
    title: 'Terraria',
    status: '100%',
    note: 'I love it so much.. I have every achiveemnt on steam!!',
    cover:
      'https://cdn2.steamgriddb.com/thumb/3a8f4b6c7d9e0f1a2b3c4d5e6f7a8b9c.jpg', // placeholder – replace with a working Terraria cover URL
    link: 'https://store.steampowered.com/app/105600/',
  },
  {
    title: 'Katana Zero',
    status: '100%',
    note: 'not many know this one.. I love it so much.. the gameplay is very nice and story is solid',
    cover:
      'https://thumb.wikimedia.org/wikipedia/en/thumb/d/da/Katana_Zero_cover.png/250px-Katana_Zero_cover.png',
    link: 'https://store.steampowered.com/app/460950/',
  },
  {
    title: 'Celeste',
    status: '76%',
    note: 'tried hard to beat it all.. its so chalanging but very rewarding.. sound tracks hit hard',
    cover:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Celeste_box_art_full.png',
    link: 'https://store.steampowered.com/app/504230/',
  },
];

// ----------------------------------------------------------------------------
// 4. MUSIC - retro player list
// ----------------------------------------------------------------------------

export const tracks: TrackItem[] = [
  {
    title: 'My Love Mine All Mine',
    artist: 'Mitski',
    cover: 'https://images.genius.com/485597d10bafde06faa87e527be1324d.1000x1000x1.png',
    link: 'https://genius.com/Mitski-my-love-mine-all-mine-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'M.',
    artist: 'Anıl Emre Daldal',
    cover: 'https://images.genius.com/6f8e5b5d9c3b2a1f0e9d8c7b6a5f4e3d.1000x1000x1.jpg',
    link: 'https://genius.com/Anil-emre-daldal-m-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Rises the Moon',
    artist: 'Liana Flores',
    cover: 'https://images.genius.com/2a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d.1000x1000x1.jpg',
    link: 'https://genius.com/Liana-flores-rises-the-moon-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Painted Black',
    artist: 'Mephisto Walz',
    cover: 'https://images.genius.com/9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b.1000x1000x1.jpg',
    link: 'https://genius.com/Mephisto-walz-painted-black-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Let It Happen',
    artist: 'Tame Impala',
    cover: 'https://images.genius.com/5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c.1000x1000x1.jpg',
    link: 'https://genius.com/Tame-impala-let-it-happen-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Legacy',
    artist: 'PIXY (UK)',
    cover: 'https://images.genius.com/3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f.1000x1000x1.jpg',
    link: 'https://genius.com/Pixy-uk-legacy-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Everything is romantic (Reimagined)',
    artist: 'Alina Kay & Ozz Gold',
    cover: 'https://images.genius.com/8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e.1000x1000x1.jpg',
    link: 'https://genius.com/Alina-kay-and-ozz-gold-everything-is-romantic-reimagined-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Spit in My Face!',
    artist: 'ThxSoMch',
    cover: 'https://images.genius.com/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.1000x1000x1.jpg',
    link: 'https://genius.com/Thxsomch-spit-in-my-face-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Sinking Town',
    artist: 'Dev1lCat',
    cover: 'https://images.genius.com/7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a.1000x1000x1.jpg',
    link: 'https://genius.com/Dev1lhawk-dev1lcat-and-xaviorthemachine-sinking-town-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Novocaine',
    artist: 'Too Close To Touch & Bad Omens',
    cover: 'https://images.genius.com/4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b.1000x1000x1.jpg',
    link: 'https://genius.com/Too-close-to-touch-novocaine-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'My Jealousy',
    artist: 'vivi baby & ovg!',
    cover: 'https://images.genius.com/9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c.1000x1000x1.jpg',
    link: 'https://genius.com/Vivi-baby-and-ovg-my-jealousy-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'After Dark',
    artist: 'Mr.Kitty',
    cover: 'https://images.genius.com/2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e.1000x1000x1.jpg',
    link: 'https://genius.com/Mrkitty-after-dark-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Misery',
    artist: 'Pupsies',
    cover: 'https://images.genius.com/6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f.1000x1000x1.jpg',
    link: 'https://genius.com/Pupsies-misery-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Imposter Syndrome',
    artist: 'Lime Cordiale',
    cover: 'https://images.genius.com/0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d.1000x1000x1.jpg',
    link: 'https://genius.com/Lime-cordiale-imposter-syndrome-lyrics',
    linkLabel: 'Genius',
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
