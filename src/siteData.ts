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

// Pixelarticons registry keys available for the top-level tabs.
export type TabIconName = 'user' | 'comment-text' | 'save' | 'cpu';

// Folder artwork uses the same centralized Pixelarticons registry.
export type InterestIconName = 'image' | 'gamepad' | 'music' | 'quote';

// Built-in icons available for social tiles (used when no "image" is given).
// Includes free Pixelarticons plus original pixel-grid fallbacks for Pro-only marks.
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
  | 'snapchat'
  | 'roblox';

export type MediaCategory = 'Movie' | 'Anime' | 'Show' | 'Cartoon' | 'Animation';

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

// Games come from Steam automatically (public/data/steam-games.json, synced by
// .github/workflows/sync-steam.yml). Anything that is NOT on Steam goes here as a manual entry.
export interface ManualAchievement {
  id: string;
  name: string;
  description: string;
  hidden: boolean;
  unlocked: boolean;
  unlockTime?: number;
  icon?: string;
  iconGray?: string;
}

export interface ManualGame {
  title: string;
  note: string;
  cover: string; // vertical cover art
  banner?: string; // optional wide art for the details screen (falls back to the cover)
  link: string;
  linkLabel: string; // concise external button label, e.g. 'minecraft.net'
  playtimeHours: number; // used for sorting + totals
  playtimeLabel: string; // shown as-is, e.g. '3000+ HRS'
  lastPlayed?: number; // unix seconds, optional (only used by the "Recently played" sort)
  achievements?: ManualAchievement[];
}

export interface TrackItem {
  id: number;
  title: string;
  artist: string;
  album?: string;
  genre: string; // used for the filter pills, e.g. 'INDIE / ALT'
  duration?: string; // 'm:ss'. Optional: shown on the record when set.
  coverUrl: string;
  // YouTube video ID (the part after ?v=). Not used by the site any more (there is no
  // built-in player); kept so the list stays easy to edit. Leave '' if you don't have one.
  youtubeId: string;
  spotifyUrl: string;
  geniusUrl: string;
  youtubeUrl: string;
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
  { id: 'socials', label: 'Socials', icon: 'comment-text', enabled: true },
  { id: 'interests', label: 'Interests', icon: 'save', enabled: true },
  { id: 'specs', label: 'Specs', icon: 'cpu', enabled: true },
];

// The four cards in the Interests hub. Change the subtitles to whatever you like.
export const interests: { id: InterestId; label: string; subtitle: string; icon: InterestIconName }[] = [
  { id: 'media', label: 'Media', subtitle: 'favorite anime & shows', icon: 'image' },
  { id: 'games', label: 'Games', subtitle: "what I'm playing / played", icon: 'gamepad' },
  { id: 'music', label: 'Music', subtitle: 'rotation & tracks', icon: 'music' },
  { id: 'quotes', label: 'Quotes', subtitle: 'saved text snippets', icon: 'quote' },
];

// ----------------------------------------------------------------------------
// 1. MAIN - profile hero
// ----------------------------------------------------------------------------

export const hero = {
  avatar: '/icon.webp',
  avatarAlt: 'Profile photo',
  // Discord avatar decoration (public/decoration.png), drawn around the photo at 120% size like Discord. null = none.
  avatarDecoration: null,
  name: 'novoumy',
  bio: [
    'I like spending way too much time on my pc.. soo I made this website to share my favorite media, games, songs and quotes. ^.^',
  ],
  badges: [
    { label: 'Status', value: 'studying..' },
    { label: 'Current Vibe', value: 'relaxed' },
    { label: 'Location', value: 'Somewhere blue' },
  ] as HeroBadge[],
};

// ----------------------------------------------------------------------------
// NOTE: the big lists live in src/data/ (media.ts, games.ts, music.ts, quotes.ts) so they only load with their folder.
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
    platform: 'Roblox',
    handle: 'novoumy',
    url: 'https://www.roblox.com/users/12026959316/profile',
    icon: 'roblox',
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
    url: 'https://www.linkedin.com/in/novoumy/',
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

export const specGroups: SpecGroup[] = [
  {
    title: 'Core Hardware',
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
    title: 'Storage & Chassis',
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
    title: 'Peripherals',
    parts: [
      {
        label: 'Monitor 1',
        name: 'ASUS TUF Gaming VG27AQ3A',
        detail: '27" 2560 x 1440 (QHD), 180Hz, VRR Supported',
        link: amazon('ASUS TUF Gaming VG27AQ3A'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'Monitor 2',
        name: 'LG FHD Monitor (Vertical)',
        detail: '1080 x 1920 (Portrait), 100Hz',
        link: amazon('LG FHD Monitor 100Hz'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'Keyboard',
        name: 'EPOMAKER x AULA F75',
        detail: '75% Gasket-Mounted Mechanical, Wireless',
        link: amazon('EPOMAKER x AULA F75'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'Mouse',
        name: 'Ajazz AJ159 Pro',
        detail: 'Lightweight Wireless Gaming Mouse',
        link: amazon('Ajazz AJ159 Pro'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'Mic',
        name: 'Fifine AM8 Dynamic Microphone',
        detail: 'USB/XLR Dual-Channel Gaming & Streaming Mic',
        link: amazon('Fifine AM8 Dynamic Microphone'),
        linkLabel: 'AMAZON',
      },
    ],
  },
  {
    title: 'Gadgets & Gear',
    parts: [
      {
        label: 'Phone',
        name: 'Samsung Galaxy A56 256GB',
        link: amazon('Samsung Galaxy A56 256GB'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'Tablet',
        name: 'Samsung Galaxy Tab S7',
        link: amazon('Samsung Galaxy Tab S7'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'Earbuds',
        name: 'Redmi Buds 6 Pro',
        link: amazon('Redmi Buds 6 Pro'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'Controller',
        name: 'Lenovo S07 Controller',
        link: amazon('Lenovo S07 controller'),
        linkLabel: 'AMAZON',
      },
      {
        label: 'Controller 2',
        name: 'EasySMX D10 Controller',
        link: amazon('EasySMX D10 controller'),
        linkLabel: 'AMAZON',
      },
    ],
  },
];