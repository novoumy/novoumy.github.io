// Morph between the main window and a folder window with the View Transitions API.
// Both windows carry `view-transition-name: site-window`, so the browser animates the
// main window's box straight into the folder's box (and back), no overlay pop.
// Browsers without view transitions (or with reduced motion) just switch instantly
// and fall back to the folder's own CSS entrance.

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let running: Promise<void> | null = null;

export function morph(update: () => void, direction: 'open' | 'close'): Promise<void> {
  const doc = document as ViewTransitionDoc;
  if (!doc.startViewTransition || reducedMotion()) {
    update();
    return Promise.resolve();
  }
  const root = document.documentElement;
  const start = () => {
    root.dataset.morph = direction;
    const transition = doc.startViewTransition!(update);
    return transition.finished
      .catch(() => undefined)
      .finally(() => {
        delete root.dataset.morph;
      });
  };
  // Never overlap two morphs: queue behind the one in flight.
  running = (running ?? Promise.resolve()).then(start, start);
  return running;
}
