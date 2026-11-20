// Morph transition: an Interests folder tile expands into the full folder view inside the main
// window (no overlay on top of the page), and collapses back into its tile on close.

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.3, 1)';
const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';
const FULL = 'inset(0px 0px 0px 0px)';

export const OPEN_MS = 680;
export const CLOSE_MS = 520;

// The window can be scaled with CSS zoom, so convert viewport rects into the host's own CSS px.
function insetFromTile(host: HTMLElement, tile: Element | null): string {
  const h = host.getBoundingClientRect();
  const sx = host.offsetWidth ? h.width / host.offsetWidth : 1;
  const sy = host.offsetHeight ? h.height / host.offsetHeight : 1;
  if (!tile) {
    // No tile (deep link / reload): grow from the centre of the window.
    const x = host.offsetWidth * 0.42;
    const y = host.offsetHeight * 0.42;
    return `inset(${y}px ${x}px ${y}px ${x}px)`;
  }
  const t = tile.getBoundingClientRect();
  const clamp = (n: number) => Math.max(0, Math.round(n));
  const top = clamp((t.top - h.top) / sy);
  const left = clamp((t.left - h.left) / sx);
  const right = clamp((h.right - t.right) / sx);
  const bottom = clamp((h.bottom - t.bottom) / sy);
  return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
}

const tileFor = (id: string) => document.querySelector(`[data-folder-tile="${id}"]`);
const hubEl = () => document.querySelector<HTMLElement>('[data-folder-hub]');

function hubPulse(direction: 'open' | 'close') {
  const hub = hubEl();
  if (!hub) return;
  hub.getAnimations().forEach((animation) => animation.cancel());
  const away = { transform: 'scale(0.9)', opacity: 0.15, filter: 'blur(3px)' };
  const home = { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' };
  hub.animate(direction === 'open' ? [home, away] : [away, home], {
    duration: direction === 'open' ? OPEN_MS : CLOSE_MS,
    easing: EASE_IN_OUT,
  });
}

// Runs right after the folder view mounts (before paint, so there is no flash of the full view).
export function playOpenMorph(overlay: HTMLElement, id: string) {
  if (reducedMotion()) return;
  const host = overlay.parentElement;
  if (!host) return;
  const from = insetFromTile(host, tileFor(id));

  overlay.getAnimations().forEach((animation) => animation.cancel());
  overlay.animate([{ clipPath: from }, { clipPath: FULL }], { duration: OPEN_MS, easing: EASE_OUT, fill: 'backwards' });

  // Solid "skin" grows with the tile, then dissolves to reveal the content.
  overlay.querySelector<HTMLElement>('[data-morph-skin]')?.animate(
    [
      { opacity: 1, offset: 0 },
      { opacity: 1, offset: 0.42 },
      { opacity: 0, offset: 1 },
    ],
    { duration: OPEN_MS, easing: 'ease-out', fill: 'both' },
  );

  // The window contents settle in from slightly zoomed-out, like the tile is opening up.
  overlay.querySelector<HTMLElement>('[data-morph-window]')?.animate(
    [
      { transform: 'scale(0.92)', opacity: 0, filter: 'blur(2px)' },
      { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' },
    ],
    { duration: OPEN_MS * 0.8, delay: OPEN_MS * 0.12, easing: EASE_OUT, fill: 'backwards' },
  );

  hubPulse('open');
}

// Collapses the open folder back into its tile; resolves when it is safe to unmount.
export function playCloseMorph(id: string): Promise<void> {
  const overlay = document.querySelector<HTMLElement>('[data-folder-overlay]');
  const host = overlay?.parentElement;
  if (!overlay || !host || reducedMotion()) return Promise.resolve();
  const to = insetFromTile(host, tileFor(id));

  overlay.getAnimations().forEach((animation) => animation.cancel());
  const clip = overlay.animate([{ clipPath: FULL }, { clipPath: to }], {
    duration: CLOSE_MS,
    easing: EASE_IN_OUT,
    fill: 'forwards',
  });
  overlay.querySelector<HTMLElement>('[data-morph-skin]')?.animate(
    [
      { opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.5 },
      { opacity: 1, offset: 1 },
    ],
    { duration: CLOSE_MS, easing: 'ease-in', fill: 'forwards' },
  );
  overlay.querySelector<HTMLElement>('[data-morph-window]')?.animate(
    [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(0.94)', opacity: 0 },
    ],
    { duration: CLOSE_MS * 0.6, easing: 'ease-in', fill: 'forwards' },
  );
  hubPulse('close');
  return clip.finished.then(
    () => undefined,
    () => undefined,
  );
}
