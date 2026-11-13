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
    '> user_status: online // brain_activity: 12%',
    '> loading personality... [██████░░░░] 60%',
    '> error 404: bio not found.',
    '\u00A0', // Creates the empty line without HTML collapsing it
    'I like spending way too much time on my pc.. soo I made this website to share my favorite media, games, songs and quotes. ^.^',
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
      'https://m.media-amazon.com/images/M/MV5BYzYxOTlkYzctNGY2MC00MjNjLWIxOWMtY2QwYjcxZWIwMmEwXkEyXkFqcGc@._V1_QL75_UY562_CR7,0,380,562_.jpg', // replace with a dedicated HxH poster if preferred
    link: 'https://www.imdb.com/title/tt2098220/',
    linkLabel: 'IMDb',
    review: 'The story the arcs the villans the power system its all just devine, one of my favorites',
  },
  {
    title: 'Demon Slayer',
    category: 'Anime',
    rating: 8.6,
    poster:
      'https://m.media-amazon.com/images/M/MV5BMWU1OGEwNmQtNGM3MS00YTYyLThmYmMtN2FjYzQzNzNmNTE0XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg', // replace with a dedicated Demon Slayer poster if preferred
    link: 'https://www.imdb.com/title/tt9335498/',
    linkLabel: 'IMDb',
    review: 'very nice visuals and great attention to detail IG',
  },
  {
    title: 'Death Note',
    category: 'Anime',
    rating: 8.9,
    poster:
      'https://m.media-amazon.com/images/M/MV5BYTgyZDhmMTEtZDFhNi00MTc4LTg3NjUtYWJlNGE5Mzk2NzMxXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg', // replace with a dedicated Death Note poster if preferred
    link: 'https://www.imdb.com/title/tt0877057/',
    linkLabel: 'IMDb',
    review: 'first anime I ever watched, I was so amazed by it That I got into anime.. A great anime overall',
  },
  {
    title: 'Frieren: Beyond Journey’s End',
    category: 'Anime',
    rating: 9.7,
    poster:
      'https://m.media-amazon.com/images/M/MV5BZTI4ZGMxN2UtODlkYS00MTBjLWE1YzctYzc3NDViMGI0ZmJmXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg', // replace with a dedicated Frieren poster if preferred
    link: 'https://www.imdb.com/title/tt22248376/',
    linkLabel: 'IMDb',
    review: 'the magic system is very pretty and the slow burn is crazyyyy :3',
  },
  {
    title: 'Horimiya',
    category: 'Anime',
    rating: 9.2,
    poster:
      'https://m.media-amazon.com/images/M/MV5BOGUzYmZkZjItNjI5Yi00NjllLThiMjUtYTY0MDI4M2Y0MmZlXkEyXkFqcGc@._V1_QL75_UY562_CR9,0,380,562_.jpg', // replace with a dedicated Horimiya poster if preferred
    link: 'https://www.imdb.com/title/tt13103134/',
    linkLabel: 'IMDb',
    review: 'I liked it a lot and a finally didnt have to wait 20 seasons for them to confess',
  },
  {
    title: 'Rascal Does Not Dream series',
    category: 'Anime',
    rating: 9.9,
    poster:
      'https://m.media-amazon.com/images/M/MV5BNTc4NWYwZDMtZDMyMi00ZTA4LWE3NDUtZTExOTNmMjNmMDA2XkEyXkFqcGc@._V1_QL75_UX388_.jpg', // replace with a dedicated Rascal poster if preferred
    link: 'https://www.imdb.com/title/tt8993398/',
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
      'https://cdn2.steamgriddb.com/thumb/020c38173caff02033564200e0288aa9.jpg',
    link: 'https://store.steampowered.com/app/105600/',
  },
  {
    title: 'Katana Zero',
    status: '100%',
    note: 'not many know this one.. I love it so much.. the gameplay is very nice and story is solid',
    cover:
      'https://cdn2.steamgriddb.com/thumb/057b1cfba313958551a8afa2c3e75429.jpg',
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
    cover: 'https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2F6041ae3ddd860d536e319c1ccba8e581.1000x1000x1.png',
    link: 'https://genius.com/Genius-english-translations-anl-emre-daldal-m-english-translation-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Rises the Moon',
    artist: 'Liana Flores',
    cover: 'https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2Fb6c30c08e6c23a4911a53df25c3f90f0.1000x1000x1.png',
    link: 'https://genius.com/Liana-flores-rises-the-moon-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Painted Black',
    artist: 'Mephisto Walz',
    cover: 'https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2Fdfee4fad0a9e020108d3d0899d6ba430.1000x1000x1.jpg',
    link: 'https://genius.com/Mephisto-walz-painted-black-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Let It Happen',
    artist: 'Tame Impala',
    cover: 'https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2Fc62e9901da159ce3cb8cca32078d87c6.1000x1000x1.png',
    link: 'https://genius.com/Tame-impala-let-it-happen-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Legacy',
    artist: 'PIXY (UK)',
    cover: 'https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2Fc8f8521aea8fbbb52a0ee290777224f0.1000x1000x1.png',
    link: 'https://genius.com/Pixy-uk-legacy-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Everything is romantic (Reimagined)',
    artist: 'Alina Kay & Ozz Gold',
    cover: 'https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2F9131f2b5152e5cd65b6a567203ca1068.1000x1000x1.png',
    link: 'https://genius.com/Alina-kay-and-ozz-gold-everything-is-romantic-reimagined-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Spit in My Face!',
    artist: 'ThxSoMch',
    cover: 'https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2F2590d316b35bf3ff7c06a4de1f537244.1000x1000x1.png',
    link: 'https://genius.com/Thxsomch-spit-in-my-face-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Sinking Town',
    artist: 'Dev1lCat',
    cover: 'https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2Ff5e83199e03614f510dcde0ace75e3a2.1000x1000x1.png',
    link: 'https://genius.com/Genius-romanizations-yoeko-kurahashi-sinking-town-romanized-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Novocaine',
    artist: 'Too Close To Touch & Bad Omens',
    cover: 'https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2F68390fdbba573f6a10e6ace9eb77f5ff.1000x1000x1.png',
    link: 'https://genius.com/Too-close-to-touch-novocaine-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'My Jealousy',
    artist: 'vivi baby & ovg!',
    cover: 'https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2Fb35fc6abb85d9813b3a17ae876563583.1000x1000x1.png',
    link: 'https://genius.com/Vivi-baby-and-ovg-my-jealousy-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'After Dark',
    artist: 'Mr.Kitty',
    cover: 'https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2F6d6ffffa21429f719636915b263b74b5.1000x1000x1.png',
    link: 'https://genius.com/Mrkitty-after-dark-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Misery',
    artist: 'Pupsies',
    cover: 'https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2F6041cd6fabc7d613927bc732ea03932e.1000x1000x1.png',
    link: 'https://genius.com/Pupsies-misery-lyrics',
    linkLabel: 'Genius',
  },
  {
    title: 'Imposter Syndrome',
    artist: 'Lime Cordiale',
    cover: 'https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2Fdba7b14007c5e2a113b1374e4fe87887.1000x1000x1.png',
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
