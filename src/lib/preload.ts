// Lazy loaders for the heavy "Interests" folder views. Calling a loader more than
// once is free (the module is cached), so hover/idle preloading never double-fetches.
export const loadGames = () => import('@/views/GamesView');
export const loadMedia = () => import('@/views/MediaView');
export const loadMusic = () => import('@/views/MusicView');
export const loadQuotes = () => import('@/views/QuotesView');

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
