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

// Top-level tabs in the tab bar.
export type TabId = 'main' | 'socials' | 'interests' | 'specs';

// Sections inside the Interests hub (opened from its 2x2 grid).
export type InterestId = 'media' | 'games' | 'music' | 'quotes';

// Built-in icons available for tabs. Options: 'user' | 'film' | 'gamepad' | 'music' | 'quote' | 'share' | 'grid' | 'cpu'
export type TabIconName = 'user' | 'film' | 'gamepad' | 'music' | 'quote' | 'share' | 'grid' | 'cpu';

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
  | 'mail'
  | 'namemc'
  | 'pinterest'
  | 'facebook'
  | 'snapchat';

export type MediaCategory = 'Movie' | 'Anime' | 'Show' | 'Cartoon';

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
  year: number; // release year only, e.g. 2014
  poster: string;
  link: string; // external page (IMDb, MyAnimeList...), opened in a new tab when the card is clicked
}

export interface GameItem {
  title: string;
  status: string; // shown in the badge, e.g. 'Completed', 'Playing', '100%'
  note: string; // shown in the pop-up
  cover: string;
  link?: string; // optional Steam / store link, shown as a button in the pop-up
  linkLabel?: string; // button text, defaults to 'Store'
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
  handle?: string; // e.g. 'novoumy'. Leave out when the profile has no readable handle.
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
  { id: 'socials', label: 'Socials', icon: 'share', enabled: true },
  { id: 'interests', label: 'Interests', icon: 'grid', enabled: true },
  { id: 'specs', label: 'Specs', icon: 'cpu', enabled: true },
];

// The four cards in the Interests hub. Change the subtitles to whatever you like.
export const interests: { id: InterestId; label: string; subtitle: string; icon: TabIconName }[] = [
  { id: 'media', label: 'Media', subtitle: 'favorite anime & shows', icon: 'film' },
  { id: 'games', label: 'Games', subtitle: "what I'm playing / played", icon: 'gamepad' },
  { id: 'music', label: 'Music', subtitle: 'rotation & tracks', icon: 'music' },
  { id: 'quotes', label: 'Quotes', subtitle: 'saved text snippets', icon: 'quote' },
];

// ----------------------------------------------------------------------------
// 1. MAIN - profile hero
// ----------------------------------------------------------------------------

export const hero = {
  avatar: '/icon.png',
  avatarAlt: 'Profile photo',
  name: 'novoumy',
  bio: [
    'I like spending way too much time on my pc.. soo I made this website to share my favorite media, games, songs and quotes. ^.^',
    '\u00A0',
    '> error 503: motivation service temporarily unavailable',
    '> activity: optimizing things that don\'t need optimization',
    '> focus_mode: enabled [██████████] 100%',
  ],
  badges: [
    { label: 'Status', value: 'studying..' },
    { label: 'Current Vibe', value: 'relaxed' },
    { label: 'Location', value: 'Somewhere blue' },
  ] as HeroBadge[],
};

// ----------------------------------------------------------------------------
// 2. MEDIA - movies, anime and shows (keep sorted A-Z by title)
// ----------------------------------------------------------------------------

export const mediaFilters: { label: string; value: 'all' | MediaCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'Movie' },
  { label: 'Anime', value: 'Anime' },
  { label: 'Shows', value: 'Show' },
  { label: 'Cartoons', value: 'Cartoon' },
];

export const media: MediaItem[] = [
  {
    title: 'Adventure Time',
    category: 'Cartoon',
    year: 2010,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjkxMzIwNmQtMzM5Ni00YWJiLTg4YjQtNjBiN2IxMjZhMGQ2XkEyXkFqcGc@._V1_QL75_UX380_CR0,2,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt1305826/',
  },
  {
    title: 'Adventure Time: Fionna and Cake',
    category: 'Cartoon',
    year: 2023,
    poster: 'https://m.media-amazon.com/images/M/MV5BMzE2MTA5YjQtMzU5Ni00MWY5LWJiMTktOWRjZjZkMDVjYjlkXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt15248880/',
  },
  {
    title: 'Aladdin',
    category: 'Cartoon',
    year: 1992,
    poster: 'https://m.media-amazon.com/images/M/MV5BMmQwYWZjZGItYzc0OC00ZDllLTg3NjItOWIyOWYwMDljMjAyXkEyXkFqcGc@._V1_QL75_UX380_CR0,13,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0103639/',
  },
  {
    title: 'All of Us Are Dead',
    category: 'Show',
    year: 2022,
    poster: 'https://m.media-amazon.com/images/M/MV5BZDY4ZmZhNzMtNjdkMC00NTE3LWFjYzQtOGE4OTllOGY1NTk5XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt14169960/',
  },
  {
    title: 'American Psycho',
    category: 'Movie',
    year: 2000,
    poster: 'https://m.media-amazon.com/images/M/MV5BNzBjM2I5ZjUtNmIzNy00OGNkLWIwZDMtOTAwYWUwMzA2YjdlXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0144084/',
  },
  {
    title: 'Anastasia',
    category: 'Cartoon',
    year: 1997,
    poster: 'https://m.media-amazon.com/images/M/MV5BMGY2YjdjNTItMGIzOC00MDNhLTkxNDMtNzgxN2U4YzA3YzRlXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0118617/',
  },
  {
    title: 'Arcane',
    category: 'Cartoon',
    year: 2021,
    poster: 'https://m.media-amazon.com/images/M/MV5BYjA2NzhlMDItNWRmZC00MzRjLWE3ZjAtZjBlZDAwOWY2ODdjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt11126994/',
  },
  {
    title: 'Atlantis',
    category: 'Cartoon',
    year: 2001,
    poster: 'https://m.media-amazon.com/images/M/MV5BODYwZTQwMDEtYjgyZS00NzNhLWFhYWMtN2Q1Y2JmZjlmZDlhXkEyXkFqcGc@._V1_QL75_UY562_CR1,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0230011/',
  },
  {
    title: 'Attack on titan',
    category: 'Anime',
    year: 2013,
    poster:
      'https://m.media-amazon.com/images/M/MV5BZjliODY5MzQtMmViZC00MTZmLWFhMWMtMjMwM2I3OGY1MTRiXkEyXkFqcGc@._V1_FMjpg_UX850_.jpg',
    link: 'https://www.imdb.com/title/tt2560140/',
  },
  {
    title: 'Avatar: Aang the Last Airbender',
    category: 'Cartoon',
    year: 2026,
    poster: 'https://m.media-amazon.com/images/M/MV5BZGQzMzIzODAtZjc5Ni00ODRkLTlhMzMtNTVkOTI4MjBhNWEyXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt18259538/',
  },
  {
    title: 'Bambi',
    category: 'Cartoon',
    year: 1942,
    poster: 'https://m.media-amazon.com/images/M/MV5BMGI5YjA2Y2EtN2UwNS00MzEyLThjMjEtNjFjZmVjZTc1ZWZmXkEyXkFqcGc@._V1_QL75_UX380_CR0,6,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0034492/',
  },
  {
    title: 'Beauty and the Beast',
    category: 'Cartoon',
    year: 1991,
    poster: 'https://m.media-amazon.com/images/M/MV5BYTY3NDg2YzktYWFjZC00MTExLTlmZDctMGY3MWYzZTlkYTNiXkEyXkFqcGc@._V1_QL75_UX380_CR0,1,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0101414/',
  },
  {
    title: 'Bird Box',
    category: 'Movie',
    year: 2018,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjAzMTI1MjMyN15BMl5BanBnXkFtZTgwNzU5MTE2NjM@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt2737304/',
  },
  {
    title: 'Brave',
    category: 'Cartoon',
    year: 2012,
    poster: 'https://m.media-amazon.com/images/M/MV5BMzgwODk3ODA1NF5BMl5BanBnXkFtZTcwNjU3NjQ0Nw@@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt1217209/',
  },
  {
    title: 'Breaking Bad',
    category: 'Show',
    year: 2008,
    poster: 'https://m.media-amazon.com/images/M/MV5BMzU5ZGYzNmQtMTdhYy00OGRiLTg0NmQtYjVjNzliZTg1ZGE4XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0903747/',
  },
  {
    title: 'Cinderella',
    category: 'Cartoon',
    year: 1950,
    poster: 'https://m.media-amazon.com/images/M/MV5BZWY3ZTM4YTUtZjg1OC00NjM2LTllMTItZjA4MGU0MzcwNjhkXkEyXkFqcGc@._V1_QL75_UY562_CR3,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0042332/',
  },
  {
    title: 'Craig of the Creek',
    category: 'Cartoon',
    year: 2018,
    poster: 'https://m.media-amazon.com/images/M/MV5BNzNlNDgxOTItNzI1Yi00ZGQzLWJhMTctMTllNmEwYWNmYTcwXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt7713450/',
  },
  {
    title: 'Cruella',
    category: 'Movie',
    year: 2021,
    poster: 'https://m.media-amazon.com/images/M/MV5BMWY5MjljNjctZjhjZS00MWY0LTgwYzUtZTJiYTVmMmJkM2E0XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt3228774/',
  },
  {
    title: 'Death Note',
    category: 'Anime',
    year: 2006,
    poster:
      'https://m.media-amazon.com/images/M/MV5BYTgyZDhmMTEtZDFhNi00MTc4LTg3NjUtYWJlNGE5Mzk2NzMxXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0877057/',
  },
  {
    title: 'Demon Slayer',
    category: 'Anime',
    year: 2019,
    poster:
      'https://m.media-amazon.com/images/M/MV5BMWU1OGEwNmQtNGM3MS00YTYyLThmYmMtN2FjYzQzNzNmNTE0XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt9335498/',
  },
  {
    title: "Don't Look Up",
    category: 'Movie',
    year: 2021,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjhhNWFjNzctYTJjOS00MDc0LThiNjItZmM0ZDVmMWViY2UzXkEyXkFqcGc@._V1_QL75_UY562_CR35,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt11286314/',
  },
  {
    title: 'Downsizing',
    category: 'Movie',
    year: 2017,
    poster: 'https://m.media-amazon.com/images/M/MV5BNDYxNDQ5OTYxOV5BMl5BanBnXkFtZTgwOTcyODkxNDM@._V1_QL75_UX380_CR0,15,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt1389072/',
  },
  {
    title: 'Elemental',
    category: 'Cartoon',
    year: 2023,
    poster: 'https://m.media-amazon.com/images/M/MV5BNjU2MjE1OGItZjdmYS00ZmIyLTljNjYtOWI5ZGRkZjM4NDEwXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt15789038/',
  },
  {
    title: 'Fight Club',
    category: 'Movie',
    year: 1999,
    poster: 'https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0137523/',
  },
  {
    title: 'Frieren: Beyond Journey’s End',
    category: 'Anime',
    year: 2023,
    poster:
      'https://m.media-amazon.com/images/M/MV5BZTI4ZGMxN2UtODlkYS00MTBjLWE1YzctYzc3NDViMGI0ZmJmXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt22248376/',
  },
  {
    title: 'Gone Girl',
    category: 'Movie',
    year: 2014,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTk0MDQ3MzAzOV5BMl5BanBnXkFtZTgwNzU1NzE3MjE@._V1_QL75_UY562_CR1,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt2267998/',
  },
  {
    title: 'Home',
    category: 'Cartoon',
    year: 2015,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjExOTQ4MDMyMV5BMl5BanBnXkFtZTgwMTE3NDM2MzE@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt2224026/',
  },
  {
    title: 'Home Alone',
    category: 'Movie',
    year: 1990,
    poster: 'https://m.media-amazon.com/images/M/MV5BNzNmNmQ2ZDEtMTc1MS00NjNiLThlMGUtZmQxNTg1Nzg5NWMzXkEyXkFqcGc@._V1_QL75_UX380_CR0,1,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0099785/',
  },
  {
    title: 'Horimiya',
    category: 'Anime',
    year: 2021,
    poster:
      'https://m.media-amazon.com/images/M/MV5BOGUzYmZkZjItNjI5Yi00NjllLThiMjUtYTY0MDI4M2Y0MmZlXkEyXkFqcGc@._V1_QL75_UY562_CR9,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt13103134/',
  },
  {
    title: 'Hotel Transylvania',
    category: 'Cartoon',
    year: 2012,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTM3NjQyODI3M15BMl5BanBnXkFtZTcwMDM4NjM0OA@@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0837562/',
  },
  {
    title: 'Hotel Transylvania 2',
    category: 'Cartoon',
    year: 2015,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTY3MTg0MzM3OV5BMl5BanBnXkFtZTgwODM4MzMwNTE@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt2510894/',
  },
  {
    title: 'Hotel Transylvania 3',
    category: 'Cartoon',
    year: 2018,
    poster: 'https://m.media-amazon.com/images/M/MV5BYzU4MmE4MjEtOTU4NS00ZTZiLTg5NTYtNzE2ZWMyODcyYzFiXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt5220122/',
  },
  {
    title: 'Hotel Transylvania 4',
    category: 'Cartoon',
    year: 2022,
    poster: 'https://m.media-amazon.com/images/M/MV5BNGYyN2Q5NGQtYWI3OS00MDMxLTlhNTktNjBkOWIwMTIzNGZkXkEyXkFqcGc@._V1_QL75_UX380_CR0,1,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt9848626/',
  },
  {
    title: 'House',
    category: 'Show',
    year: 2004,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjgxYjAwNmMtYTAwZC00YmQxLWJlOTMtMWM0NGJmNDE0YmI2XkEyXkFqcGc@._V1_QL75_UY562_CR1,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0412142/',
  },
  {
    title: 'How to Train Your Dragon',
    category: 'Cartoon',
    year: 2010,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjA5NDQyMjc2NF5BMl5BanBnXkFtZTcwMjg5ODcyMw@@._V1_QL75_UX380_CR0,1,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0892769/',
  },
  {
    title: 'How to Train Your Dragon 2',
    category: 'Cartoon',
    year: 2014,
    poster: 'https://m.media-amazon.com/images/M/MV5BMzMwMTAwODczN15BMl5BanBnXkFtZTgwMDk2NDA4MTE@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt1646971/',
  },
  {
    title: 'How to Train Your Dragon 3',
    category: 'Cartoon',
    year: 2019,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjIwMDIwNjAyOF5BMl5BanBnXkFtZTgwNDE1MDc2NTM@._V1_QL75_UX380_CR0,20,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt2386490/',
  },
  {
    title: 'Hunger',
    category: 'Movie',
    year: 2009,
    poster: 'https://m.media-amazon.com/images/M/MV5BMDMwMWZmZjMtZmZkMS00MzNmLTlmNTUtY2MyYTdkYzRiZDg0XkEyXkFqcGc@._V1_QL75_UY562_CR1,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0986233/',
  },
  {
    title: 'Hunter x Hunter',
    category: 'Anime',
    year: 2011,
    poster:
      'https://m.media-amazon.com/images/M/MV5BYzYxOTlkYzctNGY2MC00MjNjLWIxOWMtY2QwYjcxZWIwMmEwXkEyXkFqcGc@._V1_QL75_UY562_CR7,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt2098220/',
  },
  {
    title: 'Ice Age',
    category: 'Cartoon',
    year: 2002,
    poster: 'https://m.media-amazon.com/images/M/MV5BMDBlYzU2OGMtOGJjNi00ZGZjLWIwNjMtYzdiZjkwYWNjZDljXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0268380/',
  },
  {
    title: 'Ice Age 2',
    category: 'Cartoon',
    year: 2006,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjAwODg3OTAxMl5BMl5BanBnXkFtZTcwMjg2NjYyMw@@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0438097/',
  },
  {
    title: 'Ice Age 3',
    category: 'Cartoon',
    year: 2009,
    poster: 'https://m.media-amazon.com/images/M/MV5BZWJjZDYwMjgtZDZiMy00YzcyLThjN2YtYjI1ZDQ2ZDJkOTVmXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt1080016/',
  },
  {
    title: 'Inside Out',
    category: 'Cartoon',
    year: 2015,
    poster: 'https://m.media-amazon.com/images/M/MV5BOTgxMDQwMDk0OF5BMl5BanBnXkFtZTgwNjU5OTg2NDE@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt2096673/',
  },
  {
    title: 'Interstellar',
    category: 'Movie',
    year: 2014,
    poster:
      'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UY3600_.jpg',
    link: 'https://www.imdb.com/title/tt0816692/',
  },
  {
    title: 'Kung Fu Panda',
    category: 'Cartoon',
    year: 2008,
    poster: 'https://m.media-amazon.com/images/M/MV5BZDU5MDNiMGItYjVmZi00NDUxLTg2OTktNGE0NzNlNzM4NzgyXkEyXkFqcGc@._V1_QL75_UY562_CR4,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0441773/',
  },
  {
    title: 'Kung Fu Panda 2',
    category: 'Cartoon',
    year: 2011,
    poster: 'https://m.media-amazon.com/images/M/MV5BYmIxMGYzMTUtZDQzYy00ODc4LWE1YzQtZGMwYTc0YTYyYTE0XkEyXkFqcGc@._V1_QL75_UY562_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt1302011/',
  },
  {
    title: 'Kung Fu Panda 3',
    category: 'Cartoon',
    year: 2016,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTUyNzgxNjg2M15BMl5BanBnXkFtZTgwMTY1NDI1NjE@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt2267968/',
  },
  {
    title: 'Lilo & Stitch',
    category: 'Cartoon',
    year: 2002,
    poster: 'https://m.media-amazon.com/images/M/MV5BYzRiYTA1YTEtMjYwMi00NGVhLThkOGYtZDBlYjNjZDk2NDEwXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0275847/',
  },
  {
    title: 'Manchester by the Sea',
    category: 'Movie',
    year: 2016,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTYxMjk0NDg4Ml5BMl5BanBnXkFtZTgwODcyNjA5OTE@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt4034228/',
  },
  {
    title: 'Matilda',
    category: 'Movie',
    year: 1996,
    poster: 'https://m.media-amazon.com/images/M/MV5BYWE3ZDMzMmEtODgwNi00NzMxLThkYWItMTAzMWUyMzI1NDQ1XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0117008/',
  },
  {
    title: 'Oddballs',
    category: 'Cartoon',
    year: 2022,
    poster: 'https://m.media-amazon.com/images/M/MV5BZTJmNjZkYzYtYzdjMy00MmY3LWE5MzgtOWIyMmY5ZGNjMThiXkEyXkFqcGc@._V1_QL75_UY562_CR22,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt21107718/',
  },
  {
    title: 'Over the Garden Wall',
    category: 'Cartoon',
    year: 2014,
    poster: 'https://m.media-amazon.com/images/M/MV5BOTA2MTdhZmItODM3NS00ZmFlLWE4YWYtOWYxODBmNGU5YjRjXkEyXkFqcGc@._V1_QL75_UY562_CR7,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt3718778/',
  },
  {
    title: 'Pinocchio',
    category: 'Cartoon',
    year: 1940,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTU4Mzk3ODIyOF5BMl5BanBnXkFtZTgwODgyNzk2NjE@._V1_QL75_UX380_CR0,9,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0032910/',
  },
  {
    title: 'Primal Fear',
    category: 'Movie',
    year: 1996,
    poster: 'https://m.media-amazon.com/images/M/MV5BZTJlYjM5MTYtZWU3YS00ZDRhLTk1MWEtZGQyODc1ZDU2MWEwXkEyXkFqcGc@._V1_QL75_UX380_CR0,3,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0117381/',
  },
  {
    title: 'Rascal Does Not Dream series',
    category: 'Anime',
    year: 2018,
    poster:
      'https://m.media-amazon.com/images/M/MV5BZWRjNWY5YmItZTFkNS00ZjdiLWJiMWMtODFjYzk1NjU2MWU0XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt8993398/',
  },
  {
    title: 'Ratatouille',
    category: 'Cartoon',
    year: 2007,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTMzODU0NTkxMF5BMl5BanBnXkFtZTcwMjQ4MzMzMw@@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0382932/',
  },
  {
    title: 'Raya and the Last Dragon',
    category: 'Cartoon',
    year: 2021,
    poster: 'https://m.media-amazon.com/images/M/MV5BN2QzZTQ3MzktN2JiYS00MDEzLTgxMWQtZWFmMDI3NWFkZTY0XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt5109280/',
  },
  {
    title: 'Regular Show',
    category: 'Cartoon',
    year: 2010,
    poster: 'https://m.media-amazon.com/images/M/MV5BMWVmMDJmYWQtMTg5Yy00NmJlLWJmNjEtYTIyYmRjMDdmMTRlXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt1710308/',
  },
  {
    title: 'Run',
    category: 'Movie',
    year: 2020,
    poster: 'https://m.media-amazon.com/images/M/MV5BOTViNDViNDgtNDc0Ny00NWZkLTljMzctYjgzNzI5MTYwZjJlXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt8633478/',
  },
  {
    title: 'Shrek',
    category: 'Cartoon',
    year: 2001,
    poster: 'https://m.media-amazon.com/images/M/MV5BN2FkMTRkNTUtYTI0NC00ZjI4LWI5MzUtMDFmOGY0NmU2OGY1XkEyXkFqcGc@._V1_QL75_UX380_CR0,2,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0126029/',
  },
  {
    title: 'Sleeping Beauty',
    category: 'Cartoon',
    year: 1959,
    poster: 'https://m.media-amazon.com/images/M/MV5BYjVjNjZkNTQtOTRhZi00NTVhLThkMzktYzY4YjIwZWRhZjA0XkEyXkFqcGc@._V1_QL75_UY562_CR1,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0053285/',
  },
  {
    title: 'Snow White',
    category: 'Cartoon',
    year: 1937,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTQwMzE2Mzc4M15BMl5BanBnXkFtZTcwMTE4NTc1Nw@@._V1_QL75_UX380_CR0,3,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0029583/',
  },
  {
    title: 'Squid Game',
    category: 'Show',
    year: 2021,
    poster: 'https://m.media-amazon.com/images/M/MV5BMDcxYjg1OTctYmUxZi00ZjhjLWIwNTMtNmI2M2Y4OTU1YWU2XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt10919420/',
  },
  {
    title: 'Stranger Things',
    category: 'Show',
    year: 2016,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjEzMDAxOTUyMV5BMl5BanBnXkFtZTgwNzAxMzYzOTE@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt4574334/',
  },
  {
    title: 'Teen Titans Go!',
    category: 'Cartoon',
    year: 2013,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjE5MjMzOTc1Ml5BMl5BanBnXkFtZTcwNDQxMDY5OQ@@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt2771780/',
  },
  {
    title: 'The Amazing World of Gumball',
    category: 'Cartoon',
    year: 2011,
    poster: 'https://m.media-amazon.com/images/M/MV5BNWRiZTcyMDMtYTQ1Ni00YmJiLThiNDktMTEzNzFiZmZjNzNkXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt1942683/',
  },
  {
    title: 'The Bad Guys',
    category: 'Cartoon',
    year: 2022,
    poster: 'https://m.media-amazon.com/images/M/MV5BODNlYmQzY2MtZWZiZS00Y2I0LTkwNjItNjg3MjY5YTFkNWI3XkEyXkFqcGc@._V1_QL75_UX380_CR0,20,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt8115900/',
  },
  {
    title: 'The Boss Baby',
    category: 'Cartoon',
    year: 2017,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTg5MzUxNzgxNV5BMl5BanBnXkFtZTgwMTM2NzQ3MjI@._V1_QL75_UY562_CR3,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt3874544/',
  },
  {
    title: 'The Boss Baby 2',
    category: 'Cartoon',
    year: 2021,
    poster: 'https://m.media-amazon.com/images/M/MV5BZjJiYjgzMzctZmE5OC00ODA2LWE1MzktZDdlMDFiNmM5OGQ1XkEyXkFqcGc@._V1_QL75_UX380_CR0,20,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt6932874/',
  },
  {
    title: 'The Croods',
    category: 'Cartoon',
    year: 2013,
    poster: 'https://m.media-amazon.com/images/M/MV5BODU3NzI5ODc1NV5BMl5BanBnXkFtZTcwODQ2NDU1OA@@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0481499/',
  },
  {
    title: 'The Croods 2',
    category: 'Cartoon',
    year: 2020,
    poster: 'https://m.media-amazon.com/images/M/MV5BZTI1OTFhYmQtMzM4NS00Y2NkLTlkMmEtNTJhMWU1YWI0ZGQ2XkEyXkFqcGc@._V1_QL75_UY562_CR2,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt2850386/',
  },
  {
    title: 'The Karate Kid',
    category: 'Movie',
    year: 1984,
    poster: 'https://m.media-amazon.com/images/M/MV5BM2I3ZmZhNzctMzBlNC00YTc2LWE1MmEtY2ZkMzg3Y2I1ZDJhXkEyXkFqcGc@._V1_QL75_UX380_CR0,15,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0087538/',
  },
  {
    title: 'The Legend of Korra',
    category: 'Cartoon',
    year: 2012,
    poster: 'https://m.media-amazon.com/images/M/MV5BMWIyMDNmMGMtZTRjZi00ZWJkLWE2ZjAtMjYwOGFiZGVkZmYzXkEyXkFqcGc@._V1_QL75_UY562_CR1,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt1695360/',
  },
  {
    title: 'The Lion King',
    category: 'Cartoon',
    year: 1994,
    poster: 'https://m.media-amazon.com/images/M/MV5BZGRiZDZhZjItM2M3ZC00Y2IyLTk3Y2MtMWY5YjliNDFkZTJlXkEyXkFqcGc@._V1_QL75_UX380_CR0,1,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0110357/',
  },
  {
    title: 'The Little Mermaid',
    category: 'Cartoon',
    year: 1989,
    poster: 'https://m.media-amazon.com/images/M/MV5BOWMwYjFjMjUtODlhZS00NWNhLThhOTItNGRiYzgxNGQzMmE1XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0097757/',
  },
  {
    title: 'The Maze Runner',
    category: 'Movie',
    year: 2014,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjUyNTA3MTAyM15BMl5BanBnXkFtZTgwOTEyMTkyMjE@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt1790864/',
  },
  {
    title: 'The Platform',
    category: 'Movie',
    year: 2019,
    poster: 'https://m.media-amazon.com/images/M/MV5BYjUyZjNmYmMtNjA1My00ZWMyLTliZGQtODgzZjIxM2Y4NGI1XkEyXkFqcGc@._V1_QL75_UY562_CR7,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt8228288/',
  },
  {
    title: 'The Powerpuff Girls',
    category: 'Cartoon',
    year: 1998,
    poster: 'https://m.media-amazon.com/images/M/MV5BODY3YjMyOTktZWFiZS00MGNkLWExZjUtYjJjYjljMGM1YWY4XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0175058/',
  },
  {
    title: 'The Roommate',
    category: 'Movie',
    year: 2011,
    poster: 'https://m.media-amazon.com/images/M/MV5BNDZjODA1ZmUtOTgxNS00YWEwLWIwNjMtYjZiZGM0NDdhNjRkXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt1265990/',
  },
  {
    title: 'The SpongeBob Movie: Sponge on the Run',
    category: 'Cartoon',
    year: 2020,
    poster: 'https://m.media-amazon.com/images/M/MV5BZTBiZDQ2MWEtYzE1MC00YmMyLTg1NjUtNzE2YTZlMjI3MGUxXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt4823776/',
  },
  {
    title: 'Swiss Family Robinson',
    category: 'Anime',
    year: 1981,
    poster: 'https://m.media-amazon.com/images/M/MV5BNDdhZjY4YmYtNGQ4Ni00ZTVlLTg1MGEtOTEwNTUxODdiNDkxXkEyXkFqcGc@._V1_FMjpg_UY2100_.jpg',
    link: 'https://www.imdb.com/title/tt0168341/',
  },
  {
    title: 'The Terminal',
    category: 'Movie',
    year: 2004,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTM1MTIwNTMxOF5BMl5BanBnXkFtZTcwNjIxMjQyMw@@._V1_FMjpg_UY2048_.jpg',
    link: 'https://www.imdb.com/title/tt0362227/',
  },
  {
    title: 'Toy Story',
    category: 'Cartoon',
    year: 1995,
    poster: 'https://m.media-amazon.com/images/M/MV5BZTA3OWVjOWItNjE1NS00NzZiLWE1MjgtZDZhMWI1ZTlkNzYwXkEyXkFqcGc@._V1_QL75_UX380_CR0,2,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0114709/',
  },
  {
    title: 'Turning Red',
    category: 'Cartoon',
    year: 2022,
    poster: 'https://m.media-amazon.com/images/M/MV5BODY2NjExYmUtZTQ4NS00NzM2LWE2NWYtZWY2NGIyOTBmNzI3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt8097030/',
  },
  {
    title: 'Uncle Grandpa',
    category: 'Cartoon',
    year: 2010,
    poster: 'https://m.media-amazon.com/images/M/MV5BY2FiZjg3YzgtNDk4Ny00MjAyLWI2ODctNzdhZmRmYTg5N2ZlXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt3042608/',
  },
  {
    title: 'WALL-E',
    category: 'Cartoon',
    year: 2008,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjExMTg5OTU0NF5BMl5BanBnXkFtZTcwMjMxMzMzMw@@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt0910970/',
  },
  {
    title: 'We Bare Bears',
    category: 'Cartoon',
    year: 2015,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjM2NDQ5ODMxOV5BMl5BanBnXkFtZTgwMzc5MDc0NjE@._V1_QL75_UX380_CR0,4,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt4839610/',
  },
  {
    title: 'Wednesday',
    category: 'Show',
    year: 2022,
    poster: 'https://m.media-amazon.com/images/M/MV5BY2E1NDI5OWEtODJmYi00Nzg2LWI4MjUtODFiMTU2YWViOTU3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt13443470/',
  },
  {
    title: 'Wonder',
    category: 'Movie',
    year: 2017,
    poster: 'https://m.media-amazon.com/images/M/MV5BYmFkYTlhNWUtMzliMS00ODIyLThlMmUtOGQ0N2RmOTg4YjJiXkEyXkFqcGc@._V1_QL75_UX380_CR0,12,380,562_.jpg',
    link: 'https://www.imdb.com/title/tt2543472/',
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
  {
  title: 'John Wick: Chapter 1',
  category: 'Movies',
  year: 2014,
  poster: '',
  link: 'https://www.imdb.com/title/tt2911666/',
},
{
  title: 'John Wick: Chapter 2',
  category: 'Movies',
  year: 2017,
  poster: '',
  link: 'https://www.imdb.com/title/tt4425200/',
},
{
  title: 'John Wick: Chapter 3 – Parabellum',
  category: 'Movies',
  year: 2019,
  poster: '',
  link: 'https://www.imdb.com/title/tt6146586/',
},
{
  title: 'John Wick: Chapter 4',
  category: 'Movies',
  year: 2023,
  poster: '',
  link: 'https://www.imdb.com/title/tt10366206/',
},
{
  title: 'Spider-Man (Tobey Maguire)',
  category: 'Movies',
  year: 2002,
  poster: '',
  link: 'https://www.imdb.com/title/tt0145487/',
},
{
  title: 'Spider-Man 2 (Tobey Maguire)',
  category: 'Movies',
  year: 2004,
  poster: '',
  link: 'https://www.imdb.com/title/tt0316654/',
},
{
  title: 'Spider-Man 3 (Tobey Maguire)',
  category: 'Movies',
  year: 2007,
  poster: '',
  link: 'https://www.imdb.com/title/tt0413300/',
},
{
  title: 'Red Notice',
  category: 'Movies',
  year: 2021,
  poster: '',
  link: 'https://www.imdb.com/title/tt7991608/',
},
{
  title: 'Avengers: Age of Ultron',
  category: 'Movies',
  year: 2015,
  poster: '',
  link: 'https://www.imdb.com/title/tt2395427/',
},
{
  title: 'Avengers: Infinity War',
  category: 'Movies',
  year: 2018,
  poster: '',
  link: 'https://www.imdb.com/title/tt4154756/',
},
{
  title: 'Avengers: Endgame',
  category: 'Movies',
  year: 2019,
  poster: '',
  link: 'https://www.imdb.com/title/tt4154796/',
},
{
  title: 'Detective Conan: The Time Bombed Skyscraper',
  category: 'Anime',
  year: 1997,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+The+Time+Bombed+Skyscraper',
},
{
  title: 'Case Closed: The Fourteenth Target',
  category: 'Anime',
  year: 1998,
  poster: '',
  link: 'https://www.imdb.com/find?q=Case+Closed+The+Fourteenth+Target',
},
{
  title: 'Detective Conan: The Last Wizard of the Century',
  category: 'Anime',
  year: 1999,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+The+Last+Wizard+of+the+Century',
},
{
  title: 'Detective Conan: Captured in Her Eyes',
  category: 'Anime',
  year: 2000,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+Captured+in+Her+Eyes',
},
{
  title: 'Case Closed: Countdown to Heaven',
  category: 'Anime',
  year: 2001,
  poster: '',
  link: 'https://www.imdb.com/find?q=Case+Closed+Countdown+to+Heaven',
},
{
  title: 'Detective Conan: The Phantom of Baker Street',
  category: 'Anime',
  year: 2002,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+The+Phantom+of+Baker+Street',
},
{
  title: 'Detective Conan: Crossroad in the Ancient Capital',
  category: 'Anime',
  year: 2003,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+Crossroad+in+the+Ancient+Capital',
},
{
  title: 'Detective Conan: Magician of the Silver Sky',
  category: 'Anime',
  year: 2004,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+Magician+of+the+Silver+Sky',
},
{
  title: 'Detective Conan: Strategy Above the Depths',
  category: 'Anime',
  year: 2005,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+Strategy+Above+the+Depths',
},
{
  title: 'Detective Conan: The Private Eyes\' Requiem',
  category: 'Anime',
  year: 2006,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+The+Private+Eyes+Requiem',
},
{
  title: 'Detective Conan: Jolly Roger in the Deep Azure',
  category: 'Anime',
  year: 2007,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+Jolly+Roger+in+the+Deep+Azure',
},
{
  title: 'Detective Conan: Full Score of Fear',
  category: 'Anime',
  year: 2008,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+Full+Score+of+Fear',
},
{
  title: 'Detective Conan: The Raven Chaser',
  category: 'Anime',
  year: 2009,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+The+Raven+Chaser',
},
{
  title: 'Detective Conan: The Lost Ship in the Sky',
  category: 'Anime',
  year: 2010,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+The+Lost+Ship+in+the+Sky',
},
{
  title: 'Detective Conan: Quarter of Silence',
  category: 'Anime',
  year: 2011,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+Quarter+of+Silence',
},
{
  title: 'Detective Conan: The Eleventh Striker',
  category: 'Anime',
  year: 2012,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+The+Eleventh+Striker',
},
{
  title: 'Detective Conan: Private Eye in the Distant Sea',
  category: 'Anime',
  year: 2013,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+Private+Eye+in+the+Distant+Sea',
},
{
  title: 'Detective Conan: Dimensional Sniper',
  category: 'Anime',
  year: 2014,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+Dimensional+Sniper',
},
{
  title: 'Detective Conan: Sunflowers of Inferno',
  category: 'Anime',
  year: 2015,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+Sunflowers+of+Inferno',
},
{
  title: 'Detective Conan: The Darkest Nightmare',
  category: 'Anime',
  year: 2016,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+The+Darkest+Nightmare',
},
{
  title: 'Case Closed: The Crimson Love Letter',
  category: 'Anime',
  year: 2017,
  poster: '',
  link: 'https://www.imdb.com/find?q=Case+Closed+The+Crimson+Love+Letter',
},
{
  title: 'Case Closed: Zero the Enforcer',
  category: 'Anime',
  year: 2018,
  poster: '',
  link: 'https://www.imdb.com/find?q=Case+Closed+Zero+the+Enforcer',
},
{
  title: 'Case Closed: The Fist of Blue Sapphire',
  category: 'Anime',
  year: 2019,
  poster: '',
  link: 'https://www.imdb.com/find?q=Case+Closed+The+Fist+of+Blue+Sapphire',
},
{
  title: 'Detective Conan: The Scarlet Bullet',
  category: 'Anime',
  year: 2021,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+The+Scarlet+Bullet',
},
{
  title: 'Detective Conan: The Bride of Halloween',
  category: 'Anime',
  year: 2022,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+The+Bride+of+Halloween',
},
{
  title: 'Detective Conan: Black Iron Submarine',
  category: 'Anime',
  year: 2023,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+Black+Iron+Submarine',
},
{
  title: 'Detective Conan: The Million-Dollar Pentagram',
  category: 'Anime',
  year: 2024,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+The+Million-Dollar+Pentagram',
},
{
  title: 'Detective Conan: One-Eyed Flashback',
  category: 'Anime',
  year: 2025,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+One-Eyed+Flashback',
},
{
  title: 'Detective Conan: Fallen Angel of the Highway',
  category: 'Anime',
  year: 2026,
  poster: '',
  link: 'https://www.imdb.com/find?q=Detective+Conan+Fallen+Angel+of+the+Highway',
},
{
  title: 'Tomo-chan Is a Girl!',
  category: 'Anime',
  year: 2023,
  poster: '',
  link: 'https://www.imdb.com/find?q=Tomo-chan+Is+a+Girl',
},
{
  title: 'Spy x Family',
  category: 'Anime',
  year: 2022,
  poster: '',
  link: 'https://www.imdb.com/find?q=Spy+x+Family',
},
{
  title: 'Kiki\'s Delivery Service',
  category: 'Anime',
  year: 1989,
  poster: '',
  link: 'https://www.imdb.com/find?q=Kiki%27s+Delivery+Service',
},
{
  title: 'Ponyo',
  category: 'Anime',
  year: 2008,
  poster: '',
  link: 'https://www.imdb.com/find?q=Ponyo',
},
{
  title: 'Penguin Highway',
  category: 'Anime',
  year: 2018,
  poster: '',
  link: 'https://www.imdb.com/find?q=Penguin+Highway',
},
{
  title: 'One-Punch Man',
  category: 'Anime',
  year: 2015,
  poster: '',
  link: 'https://www.imdb.com/find?q=One-Punch+Man',
},
{
  title: 'Delicious in Dungeon',
  category: 'Anime',
  year: 2024,
  poster: '',
  link: 'https://www.imdb.com/find?q=Delicious+in+Dungeon',
},
{
  title: 'Solo Leveling',
  category: 'Anime',
  year: 2024,
  poster: '',
  link: 'https://www.imdb.com/find?q=Solo+Leveling',
},
{
  title: 'Vinland Saga',
  category: 'Anime',
  year: 2019,
  poster: '',
  link: 'https://www.imdb.com/find?q=Vinland+Saga',
},
{
  title: 'My Dress-Up Darling',
  category: 'Anime',
  year: 2022,
  poster: '',
  link: 'https://www.imdb.com/find?q=My+Dress-Up+Darling',
},
{
  title: 'More Than a Married Couple, But Not Lovers',
  category: 'Anime',
  year: 2022,
  poster: '',
  link: 'https://www.imdb.com/find?q=More+Than+a+Married+Couple+But+Not+Lovers',
},
{
  title: 'The Apothecary Diaries',
  category: 'Anime',
  year: 2023,
  poster: '',
  link: 'https://www.imdb.com/find?q=The+Apothecary+Diaries',
},
{
  title: 'Our Dating Story: The Experienced You and the Inexperienced Me',
  category: 'Anime',
  year: 2023,
  poster: '',
  link: 'https://www.imdb.com/find?q=Our+Dating+Story+The+Experienced+You+and+the+Inexperienced+Me',
},
{
  title: 'The Fragrant Flower Blooms with Dignity',
  category: 'Anime',
  year: 2025,
  poster: '',
  link: 'https://www.imdb.com/find?q=The+Fragrant+Flower+Blooms+with+Dignity',
},
{
  title: 'The Angel Next Door Spoils Me Rotten',
  category: 'Anime',
  year: 2023,
  poster: '',
  link: 'https://www.imdb.com/find?q=The+Angel+Next+Door+Spoils+Me+Rotten',
},
{
  title: 'Pseudo Harem',
  category: 'Anime',
  year: 2024,
  poster: '',
  link: 'https://www.imdb.com/find?q=Pseudo+Harem',
},
{
  title: 'Jujutsu Kaisen',
  category: 'Anime',
  year: 2020,
  poster: '',
  link: 'https://www.imdb.com/find?q=Jujutsu+Kaisen',
},
{
  title: 'Lovely Complex',
  category: 'Anime',
  year: 2007,
  poster: '',
  link: 'https://www.imdb.com/find?q=Lovely+Complex',
},
{
  title: 'My Love Story with Yamada-kun at Lv999',
  category: 'Anime',
  year: 2023,
  poster: '',
  link: 'https://www.imdb.com/find?q=My+Love+Story+with+Yamada-kun+at+Lv999',
},
{
  title: 'I Want to Eat Your Pancreas',
  category: 'Anime',
  year: 2018,
  poster: '',
  link: 'https://www.imdb.com/find?q=I+Want+to+Eat+Your+Pancreas',
},
{
  title: 'Your Name.',
  category: 'Anime',
  year: 2016,
  poster: '',
  link: 'https://www.imdb.com/find?q=Your+Name',
},
{
  title: 'A Silent Voice',
  category: 'Anime',
  year: 2016,
  poster: '',
  link: 'https://www.imdb.com/find?q=A+Silent+Voice',
},
{
  title: 'Tanken Driland',
  category: 'Anime',
  year: 2012,
  poster: '',
  link: 'https://www.imdb.com/find?q=Tanken+Driland',
},
{
  title: 'The Queen\'s Gambit',
  category: 'Shows',
  year: 2020,
  poster: '',
  link: 'https://www.imdb.com/title/tt10048342/',
},
{
  title: 'Spider-Man: Into the Spider-Verse (Miles Morales)',
  category: 'Cartoon',
  year: 2018,
  poster: '',
  link: 'https://www.imdb.com/title/tt4633694/',
},
{
  title: 'Spider-Man: Across the Spider-Verse (Miles Morales)',
  category: 'Cartoon',
  year: 2023,
  poster: '',
  link: 'https://www.imdb.com/title/tt9362722/',
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
  {
    platform: 'GitHub',
    handle: 'novoumy',
    url: 'https://github.com/novoumy/',
    icon: 'github',
  },
  {
    platform: 'Instagram',
    handle: 'novoumy',
    url: 'https://www.instagram.com/novoumy/',
    icon: 'instagram',
  },
  {
    platform: 'X',
    handle: 'novoumy',
    url: 'https://x.com/novoumy',
    icon: 'x',
  },
  {
    platform: 'YouTube',
    handle: 'novoumy',
    url: 'https://www.youtube.com/channel/UCuMbrUTzj2-Rl3umhFhAOkA',
    icon: 'youtube',
  },
  {
    platform: 'NameMC',
    handle: 'novoumy',
    url: 'https://namemc.com/profile/novoumy.1',
    icon: 'namemc',
  },
  {
    platform: 'Pinterest',
    handle: 'novoumy',
    url: 'https://de.pinterest.com/novoumy/',
    icon: 'pinterest',
  },
  {
    platform: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61596482073922',
    icon: 'facebook',
  },
  {
    platform: 'Snapchat',
    handle: 'novoumy',
    url: 'https://www.snapchat.com/@novoumy',
    icon: 'snapchat',
  },
  {
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/novoumy-rah-01085544b/',
    icon: 'linkedin',
  },
  {
    platform: 'Email',
    handle: 'contact@novoumy.com',
    url: 'mailto:contact@novoumy.com',
    icon: 'mail',
  },
];

// ----------------------------------------------------------------------------
// SPECS - PC build. Each part has a label, the name/specs, and a store link.
// Replace the search links with the exact product page when you have it.
// ----------------------------------------------------------------------------

export interface SpecPart {
  label: string;
  name: string;
  detail?: string;
  link: string;
  linkLabel: string; // shown as [ LABEL ]
}

export interface SpecGroup {
  title: string;
  parts: SpecPart[];
}

const newegg = (query: string) => `https://www.newegg.com/p/pl?d=${encodeURIComponent(query)}`;
const amazon = (query: string) => `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;

export const specsSummary = [
  { label: 'RIG_ID', value: 'BLU_MACHINE' },
  { label: 'OS', value: 'Windows 11 Pro' },
  { label: 'STATUS', value: 'OPTIMIZED' },
];

export const specGroups: SpecGroup[] = [
  {
    title: 'Core',
    parts: [
      {
        label: 'CPU',
        name: 'Intel Core i7-14700KF',
        detail: '33MB Cache, up to 5.60 GHz',
        link: newegg('Intel Core i7-14700KF'),
        linkLabel: 'NEW EGG',
      },
      {
        label: 'Cooler',
        name: 'Red Dragon CC-118 Dual-Tower Air Cooler',
        detail: 'ARGB',
        link: amazon('Red Dragon CC-118 Dual-Tower Air Cooler ARGB'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'GPU',
        name: 'ASUS GeForce RTX 5070 PRIME',
        detail: '12GB GDDR6',
        link: newegg('ASUS GeForce RTX 5070 PRIME 12GB'),
        linkLabel: 'NEW EGG',
      },
      {
        label: 'Mobo',
        name: 'ASUS PRIME Z790-P WiFi',
        link: newegg('ASUS PRIME Z790-P WiFi'),
        linkLabel: 'NEW EGG',
      },
      {
        label: 'RAM',
        name: '32GB (2x16GB) Lexar THOR DDR5',
        detail: '6000 MHz, OC',
        link: amazon('Lexar THOR DDR5 32GB 2x16GB 6000MHz'),
        linkLabel: 'AMAZON',
      },
    ],
  },
  {
    title: 'Storage, Power & Case',
    parts: [
      {
        label: 'SSD 1',
        name: 'Western Digital Black SN770',
        detail: '2TB NVMe M.2 SSD',
        link: amazon('Western Digital Black SN770 2TB NVMe'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'SSD 2',
        name: 'Team Group MP33 Pro',
        detail: '1TB NVMe SSD',
        link: amazon('Team Group MP33 Pro 1TB NVMe'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'PSU',
        name: 'FSP Hydro Pro 800W',
        detail: '80+ Bronze',
        link: newegg('FSP Hydro Pro 800W'),
        linkLabel: 'NEW EGG',
      },
      {
        label: 'Case',
        name: 'Cougar FV150 RGB Mid-Tower',
        detail: 'Black',
        link: newegg('Cougar FV150 RGB Mid-Tower'),
        linkLabel: 'NEW EGG',
      },
    ],
  },
  {
    title: 'Peripherals & Audio',
    parts: [
      {
        label: 'Mic',
        name: 'Fifine AM8 Dynamic Microphone',
        link: amazon('Fifine AM8 Dynamic Microphone'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'Pad 1',
        name: 'Lenovo Pad',
        link: amazon('Lenovo Pad'),
        linkLabel: 'AMAZON',
      },
    ],
  },
];