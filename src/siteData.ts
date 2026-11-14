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
  | 'mail';

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
  featured?: boolean; // shown as the big "Primary Comms" banner (use on one item)
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

  // ==========================================================================
  // CARTOONS (continued)
  // ==========================================================================
  // TODO: replace `poster` with a real m.media-amazon.com/...jpg URL.
  {
    title: 'The Lion King',
    category: 'Cartoon',
    rating: 1994,
    poster: '',
    link: 'https://www.imdb.com/title/tt0110357/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Snow White',
    category: 'Cartoon',
    rating: 1937,
    poster: '',
    link: 'https://www.imdb.com/title/tt0029583/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Aladdin',
    category: 'Cartoon',
    rating: 1992,
    poster: '',
    link: 'https://www.imdb.com/title/tt0103639/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Beauty and the Beast',
    category: 'Cartoon',
    rating: 1991,
    poster: '',
    link: 'https://www.imdb.com/title/tt0101414/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Pinocchio',
    category: 'Cartoon',
    rating: 1940,
    poster: '',
    link: 'https://www.imdb.com/title/tt0032910/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Sleeping Beauty',
    category: 'Cartoon',
    rating: 1959,
    poster: '',
    link: 'https://www.imdb.com/title/tt0053285/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The Little Mermaid',
    category: 'Cartoon',
    rating: 1989,
    poster: '',
    link: 'https://www.imdb.com/title/tt0097757/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Anastasia',
    category: 'Cartoon',
    rating: 1997,
    poster: '',
    link: 'https://www.imdb.com/title/tt0118617/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Raya and the Last Dragon',
    category: 'Cartoon',
    rating: 2021,
    poster: '',
    link: 'https://www.imdb.com/title/tt5109280/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The Croods',
    category: 'Cartoon',
    rating: 2013,
    poster: '',
    link: 'https://www.imdb.com/title/tt0481499/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The Croods 2',
    category: 'Cartoon',
    rating: 2020,
    poster: '',
    link: 'https://www.imdb.com/title/tt2850386/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Cinderella',
    category: 'Cartoon',
    rating: 1950,
    poster: '',
    link: 'https://www.imdb.com/title/tt0042332/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Bambi',
    category: 'Cartoon',
    rating: 1942,
    poster: '',
    link: 'https://www.imdb.com/title/tt0034492/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Hotel Transylvania',
    category: 'Cartoon',
    rating: 2012,
    poster: '',
    link: 'https://www.imdb.com/title/tt0837562/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Hotel Transylvania 2',
    category: 'Cartoon',
    rating: 2015,
    poster: '',
    link: 'https://www.imdb.com/title/tt2510894/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Hotel Transylvania 3',
    category: 'Cartoon',
    rating: 2018,
    poster: '',
    link: 'https://www.imdb.com/title/tt5220122/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Hotel Transylvania 4',
    category: 'Cartoon',
    rating: 2022,
    poster: '',
    link: 'https://www.imdb.com/title/tt9848626/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'How to Train Your Dragon',
    category: 'Cartoon',
    rating: 2010,
    poster: '',
    link: 'https://www.imdb.com/title/tt0892769/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'How to Train Your Dragon 2',
    category: 'Cartoon',
    rating: 2014,
    poster: '',
    link: 'https://www.imdb.com/title/tt1646971/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'How to Train Your Dragon 3',
    category: 'Cartoon',
    rating: 2019,
    poster: '',
    link: 'https://www.imdb.com/title/tt2386490/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Turning Red',
    category: 'Cartoon',
    rating: 2022,
    poster: '',
    link: 'https://www.imdb.com/title/tt8097030/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The Bad Guys',
    category: 'Cartoon',
    rating: 2022,
    poster: '',
    link: 'https://www.imdb.com/title/tt8115900/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Inside Out',
    category: 'Cartoon',
    rating: 2015,
    poster: '',
    link: 'https://www.imdb.com/title/tt2096673/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Toy Story',
    category: 'Cartoon',
    rating: 1995,
    poster: '',
    link: 'https://www.imdb.com/title/tt0114709/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Ice Age',
    category: 'Cartoon',
    rating: 2002,
    poster: '',
    link: 'https://www.imdb.com/title/tt0268380/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Ice Age 2',
    category: 'Cartoon',
    rating: 2006,
    poster: '',
    link: 'https://www.imdb.com/title/tt0438097/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Ice Age 3',
    category: 'Cartoon',
    rating: 2009,
    poster: '',
    link: 'https://www.imdb.com/title/tt1080016/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The Boss Baby',
    category: 'Cartoon',
    rating: 2017,
    poster: '',
    link: 'https://www.imdb.com/title/tt3874544/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The Boss Baby 2',
    category: 'Cartoon',
    rating: 2021,
    poster: '',
    link: 'https://www.imdb.com/title/tt6932874/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Shrek',
    category: 'Cartoon',
    rating: 2001,
    poster: '',
    link: 'https://www.imdb.com/title/tt0126029/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Kung Fu Panda',
    category: 'Cartoon',
    rating: 2008,
    poster: '',
    link: 'https://www.imdb.com/title/tt0441773/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Kung Fu Panda 2',
    category: 'Cartoon',
    rating: 2011,
    poster: '',
    link: 'https://www.imdb.com/title/tt1302011/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Kung Fu Panda 3',
    category: 'Cartoon',
    rating: 2016,
    poster: '',
    link: 'https://www.imdb.com/title/tt2267968/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Ratatouille',
    category: 'Cartoon',
    rating: 2007,
    poster: '',
    link: 'https://www.imdb.com/title/tt0382932/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'WALL-E',
    category: 'Cartoon',
    rating: 2008,
    poster: '',
    link: 'https://www.imdb.com/title/tt0910970/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Lilo & Stitch',
    category: 'Cartoon',
    rating: 2002,
    poster: '',
    link: 'https://www.imdb.com/title/tt0275847/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Brave',
    category: 'Cartoon',
    rating: 2012,
    poster: '',
    link: 'https://www.imdb.com/title/tt1217209/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Atlantis',
    category: 'Cartoon',
    rating: 2001,
    poster: '',
    link: 'https://www.imdb.com/title/tt0230011/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Elemental',
    category: 'Cartoon',
    rating: 2023,
    poster: '',
    link: 'https://www.imdb.com/title/tt15789038/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Home',
    category: 'Cartoon',
    rating: 2015,
    poster: '',
    link: 'https://www.imdb.com/title/tt2224026/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The SpongeBob Movie: Sponge on the Run',
    category: 'Cartoon',
    rating: 2020,
    poster: '',
    link: 'https://www.imdb.com/title/tt4823776/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Avatar: Aang the Last Airbender',
    category: 'Cartoon',
    rating: 2026,
    poster: '',
    link: 'https://www.imdb.com/title/tt18259538/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Oddballs',
    category: 'Cartoon',
    rating: 2022,
    poster: '',
    link: 'https://www.imdb.com/title/tt21107718/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The Legend of Korra',
    category: 'Cartoon',
    rating: 2012,
    poster: '',
    link: 'https://www.imdb.com/title/tt1695360/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Adventure Time',
    category: 'Cartoon',
    rating: 2010,
    poster: '',
    link: 'https://www.imdb.com/title/tt1305826/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Uncle Grandpa',
    category: 'Cartoon',
    rating: 2013,
    poster: '',
    link: 'https://www.imdb.com/title/tt2712902/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Adventure Time: Fionna and Cake',
    category: 'Cartoon',
    rating: 2023,
    poster: '',
    link: 'https://www.imdb.com/title/tt15248880/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Arcane',
    category: 'Cartoon',
    rating: 2021,
    poster: '',
    link: 'https://www.imdb.com/title/tt11126994/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The Amazing World of Gumball',
    category: 'Cartoon',
    rating: 2011,
    poster: '',
    link: 'https://www.imdb.com/title/tt1942683/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Regular Show',
    category: 'Cartoon',
    rating: 2010,
    poster: '',
    link: 'https://www.imdb.com/title/tt1710308/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'We Bare Bears',
    category: 'Cartoon',
    rating: 2015,
    poster: '',
    link: 'https://www.imdb.com/title/tt4839610/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The Powerpuff Girls',
    category: 'Cartoon',
    rating: 1998,
    poster: '',
    link: 'https://www.imdb.com/title/tt0175058/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Teen Titans Go!',
    category: 'Cartoon',
    rating: 2013,
    poster: '',
    link: 'https://www.imdb.com/title/tt2771780/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Over the Garden Wall',
    category: 'Cartoon',
    rating: 2014,
    poster: '',
    link: 'https://www.imdb.com/title/tt3718778/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Craig of the Creek',
    category: 'Cartoon',
    rating: 2018,
    poster: '',
    link: 'https://www.imdb.com/title/tt7713450/',
    linkLabel: 'IMDb',
    review: '',
  },

  // ==========================================================================
  // MOVIES
  // ==========================================================================
  // TODO: replace `poster` with a real m.media-amazon.com/...jpg URL.
  {
    title: 'The Maze Runner',
    category: 'Movie',
    rating: 2014,
    poster: '',
    link: 'https://www.imdb.com/title/tt1790864/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Wonder',
    category: 'Movie',
    rating: 2017,
    poster: '',
    link: 'https://www.imdb.com/title/tt2543472/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Home Alone',
    category: 'Movie',
    rating: 1990,
    poster: '',
    link: 'https://www.imdb.com/title/tt0099785/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The Platform',
    category: 'Movie',
    rating: 2019,
    poster: '',
    link: 'https://www.imdb.com/title/tt8228288/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Matilda',
    category: 'Movie',
    rating: 1996,
    poster: '',
    link: 'https://www.imdb.com/title/tt0117008/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The Karate Kid',
    category: 'Movie',
    rating: 1984,
    poster: '',
    link: 'https://www.imdb.com/title/tt0087538/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Hunger',
    category: 'Movie',
    rating: 2009,
    poster: '',
    link: 'https://www.imdb.com/title/tt0986233/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Cruella',
    category: 'Movie',
    rating: 2021,
    poster: '',
    link: 'https://www.imdb.com/title/tt3228774/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Run',
    category: 'Movie',
    rating: 2020,
    poster: '',
    link: 'https://www.imdb.com/title/tt8633478/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Gone Girl',
    category: 'Movie',
    rating: 2014,
    poster: '',
    link: 'https://www.imdb.com/title/tt2267998/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Bird Box',
    category: 'Movie',
    rating: 2018,
    poster: '',
    link: 'https://www.imdb.com/title/tt2737304/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: "Don't Look Up",
    category: 'Movie',
    rating: 2021,
    poster: '',
    link: 'https://www.imdb.com/title/tt11286314/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The Swiss Family Robinson',
    category: 'Movie',
    rating: 1960,
    poster: '',
    link: 'https://www.imdb.com/title/tt0054494/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Fight Club',
    category: 'Movie',
    rating: 1999,
    poster: '',
    link: 'https://www.imdb.com/title/tt0137523/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Downsizing',
    category: 'Movie',
    rating: 2017,
    poster: '',
    link: 'https://www.imdb.com/title/tt1389072/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'American Psycho',
    category: 'Movie',
    rating: 2000,
    poster: '',
    link: 'https://www.imdb.com/title/tt0144084/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Primal Fear',
    category: 'Movie',
    rating: 1996,
    poster: '',
    link: 'https://www.imdb.com/title/tt0117381/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The Roommate',
    category: 'Movie',
    rating: 2011,
    poster: '',
    link: 'https://www.imdb.com/title/tt1265990/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'The Terminal',
    category: 'Movie',
    rating: 2004,
    poster: '',
    link: 'https://www.imdb.com/title/tt0361862/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Manchester by the Sea',
    category: 'Movie',
    rating: 2016,
    poster: '',
    link: 'https://www.imdb.com/title/tt4034228/',
    linkLabel: 'IMDb',
    review: '',
  },

  // ==========================================================================
  // SHOWS
  // ==========================================================================
  // TODO: replace `poster` with a real m.media-amazon.com/...jpg URL.
  {
    title: 'Wednesday',
    category: 'Show',
    rating: 2022,
    poster: '',
    link: 'https://www.imdb.com/title/tt13443470/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Squid Game',
    category: 'Show',
    rating: 2021,
    poster: '',
    link: 'https://www.imdb.com/title/tt10919420/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'All of Us Are Dead',
    category: 'Show',
    rating: 2022,
    poster: '',
    link: 'https://www.imdb.com/title/tt14169960/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Stranger Things',
    category: 'Show',
    rating: 2016,
    poster: '',
    link: 'https://www.imdb.com/title/tt4574334/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'Breaking Bad',
    category: 'Show',
    rating: 2008,
    poster: '',
    link: 'https://www.imdb.com/title/tt0903747/',
    linkLabel: 'IMDb',
    review: '',
  },
  {
    title: 'House',
    category: 'Show',
    rating: 2004,
    poster: '',
    link: 'https://www.imdb.com/title/tt0412142/',
    linkLabel: 'IMDb',
    review: '',
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
    featured: true,
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
        name: 'Lenovo S07 Controller',
        link: amazon('Lenovo S07 Controller'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'Pad 2',
        name: 'EasySMX D10 Controller',
        link: amazon('EasySMX D10 Controller'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'Mouse',
        name: 'Ajazz AJ159',
        link: amazon('Ajazz AJ159 mouse'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'Keys',
        name: 'EPOMAKER x Aula F75',
        link: amazon('EPOMAKER x Aula F75 keyboard'),
        linkLabel: 'AMAZON',
      },
    ],
  },
];
