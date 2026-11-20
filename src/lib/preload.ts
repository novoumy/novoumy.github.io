import type { ComponentType } from 'react';
import type { InterestId } from '@/siteData';

// Lazy loaders for the heavy "Interests" folder views. Calling a loader more than
// once is free (the module is cached), so hover/idle preloading never double-fetches.
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

export function preloadInterestViews(): () => void {
  const run = () => {
    void loadGames();
    void loadMedia();
    void loadMusic();
    void loadQuotes();
  };
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
  if (idle) {
    const id = idle(run);
    return () => (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(run, 800);
  return () => window.clearTimeout(id);
}
