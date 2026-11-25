import type { ComponentType } from 'react';
import type { InterestId } from '@/siteData';

// Lazy loaders for the heavy "Interests" folder views. Nothing is loaded at startup: a folder's code is fetched
// when its icon is hovered / focused or when it is opened. Calling a loader more than once is free (cached).
// Once a module has arrived its component is also kept here, so opening the folder can
// render it synchronously (needed for the window morph to land on real content).
export type FolderView = ComponentType<{ onClose: () => void }>;
const ready: Partial<Record<InterestId, FolderView>> = {};

const keep = <T extends { default: FolderView }>(id: InterestId, load: () => Promise<T>) => () =>
  load().then((mod) => {
    ready[id] = mod.default;
    return mod;
  });

export const loadGames = keep('games', () => import('@/views/GamesView'));
export const loadMedia = keep('media', () => import('@/views/MediaView'));
export const loadMusic = keep('music', () => import('@/views/MusicView'));
export const loadQuotes = keep('quotes', () => import('@/views/QuotesView'));

const LOADERS: Record<InterestId, () => Promise<unknown>> = {
  games: loadGames,
  media: loadMedia,
  music: loadMusic,
  quotes: loadQuotes,
};

export const loadInterestView = (id: InterestId) => LOADERS[id]().catch(() => undefined);
export const loadedInterestView = (id: InterestId): FolderView | undefined => ready[id];
