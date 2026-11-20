import { playSfx } from '@/audio/sfx';
import type { InterestId } from '@/siteData';

// "Dive" transition used when opening / closing an Interests folder.
//
// Opening:  the clicked folder icon pulses, a pixel ring pops off it, the hub behind
//           zooms toward you and fades, while the folder window grows out of the icon
//           itself (clip-path from the icon's rect to the full window). The title bar
//           drops in and the content staggers up once the window is mostly open.
// Closing:  the exact reverse - the window shrinks back into the same icon while the hub
//           zooms back to rest, and the icon gives a little "landed" pop.
//
// Only transform / opacity / clip-path are animated, so it stays on the compositor and
// feels smooth even with the big library views mounted.
type Destination = 'folder' | 'hub';

const STAGE_SELECTOR = '[data-crt-stage]';
const WINDOW_SELECTOR = '.r-window';
const OPEN_MS = 580;
const CLOSE_MS = 440;
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';
const EASE_IN = 'cubic-bezier(0.5, 0, 0.85, 0.35)';
// Negative inset so the pixel-frame box-shadow is never clipped at full size.
const CLIP_FULL = 'inset(-16px)';
const HUB_ZOOM = 1.5;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let running: Promise<void> | null = null;

const finished = (animation: Animation): Promise<void> =>
  animation.finished.then(
    () => undefined,
    () => undefined,
  );

function folderIcon(id: InterestId | null): HTMLElement | null {
  if (!id) return null;
  const button = document.querySelector<HTMLElement>(`[data-folder-id="${id}"]`);
  return button?.querySelector<HTMLElement>('svg') ?? button;
}

const usable = (rect: DOMRect | undefined): rect is DOMRect => !!rect && rect.width > 0 && rect.height > 0;

// clip-path that matches `icon` (padded a touch) inside the window rect.
function clipAround(icon: DOMRect, win: DOMRect, pad = 6): string {
  const top = Math.max(0, icon.top - pad - win.top);
  const left = Math.max(0, icon.left - pad - win.left);
  const right = Math.max(0, win.right - (icon.right + pad));
  const bottom = Math.max(0, win.bottom - (icon.bottom + pad));
  return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
}

// Percent origin (zoom-safe, unlike px) so the hub zooms toward the icon that was clicked.
function setStageOrigin(stage: HTMLElement, icon: DOMRect | undefined) {
  const rect = stage.getBoundingClientRect();
  if (!usable(icon) || rect.width === 0 || rect.height === 0) {
    stage.style.transformOrigin = '50% 50%';
    return;
  }
  const x = ((icon.left + icon.width / 2 - rect.left) / rect.width) * 100;
  const y = ((icon.top + icon.height / 2 - rect.top) / rect.height) * 100;
  stage.style.transformOrigin = `${x}% ${y}%`;
}

// A square pixel ring that pops off the icon.
function ringPop(icon: DOMRect): Animation {
  const size = Math.max(icon.width, icon.height) + 12;
  const ring = document.createElement('div');
  ring.className = 'folder-ring';
  ring.style.cssText = `left:${icon.left + icon.width / 2 - size / 2}px;top:${icon.top + icon.height / 2 - size / 2}px;width:${size}px;height:${size}px`;
  document.body.appendChild(ring);
  const animation = ring.animate(
    [
      { opacity: 0.95, transform: 'scale(0.7)' },
      { opacity: 0, transform: 'scale(2.1)' },
    ],
    { duration: 520, easing: EASE_OUT, fill: 'forwards' },
  );
  void finished(animation).then(() => ring.remove());
  return animation;
}

function windowParts(win: HTMLElement) {
  const children = Array.from(win.children) as HTMLElement[];
  const titlebar = win.querySelector<HTMLElement>('.r-titlebar');
  const rest = children.filter((child) => child !== titlebar);
  // The scrolling body carries data-side; its single child wraps whatever the folder renders.
  const inner = win.querySelector<HTMLElement>('[data-side] > div');
  const items = inner ? (Array.from(inner.children) as HTMLElement[]).slice(0, 10) : [];
  return { titlebar, rest, items };
}

async function runOpen(update: () => void, id: InterestId | null) {
  const stage = document.querySelector<HTMLElement>(STAGE_SELECTOR);
  const iconEl = folderIcon(id);
  const iconRect = iconEl?.getBoundingClientRect();

  if (!stage || !iconEl || !usable(iconRect) || reducedMotion()) {
    update();
    return;
  }

  const root = document.documentElement;
  root.dataset.folderTransition = 'true';
  setStageOrigin(stage, iconRect);
  playSfx('open');

  // The folder is already loaded, so this commits the full window synchronously.
  update();
  const win = document.querySelector<HTMLElement>(WINDOW_SELECTOR);
  if (!win) {
    delete root.dataset.folderTransition;
    stage.style.transformOrigin = '';
    return;
  }
  // The window's own one-shot rise animation would fight this one.
  win.classList.remove('animate-overlay-in');

  const winRect = win.getBoundingClientRect();
  const startClip = clipAround(iconRect, winRect);
  const { titlebar, rest, items } = windowParts(win);
  const animations: Animation[] = [];

  // Window grows out of the icon.
  animations.push(
    win.animate([{ clipPath: startClip }, { clipPath: CLIP_FULL }], {
      duration: OPEN_MS,
      easing: EASE_OUT,
      fill: 'backwards',
    }),
  );
  // Hub dives away behind it.
  animations.push(
    stage.animate(
      [
        { transform: 'scale(1)', opacity: 1 },
        { transform: `scale(${HUB_ZOOM})`, opacity: 0 },
      ],
      { duration: OPEN_MS * 0.85, easing: EASE_IN, fill: 'forwards' },
    ),
  );
  animations.push(ringPop(iconRect));
  // The icon itself gives a quick press-and-release.
  animations.push(
    iconEl.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(0.86)', offset: 0.35 }, { transform: 'scale(1.12)' }],
      { duration: 260, easing: EASE_OUT, fill: 'forwards' },
    ),
  );

  // Chrome and content arrive once the window is mostly open.
  if (titlebar) {
    animations.push(
      titlebar.animate(
        [
          { opacity: 0, transform: 'translateY(-70%)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 420, delay: 140, easing: EASE_OUT, fill: 'backwards' },
      ),
    );
  }
  rest.forEach((el, index) => {
    animations.push(
      el.animate(
        [
          { opacity: 0, transform: 'translateY(14px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 420, delay: 190 + index * 50, easing: EASE_OUT, fill: 'backwards' },
      ),
    );
  });
  items.forEach((el, index) => {
    animations.push(
      el.animate(
        [
          { opacity: 0, transform: 'translateY(16px) scale(0.97)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
        { duration: 420, delay: 260 + index * 38, easing: EASE_OUT, fill: 'backwards' },
      ),
    );
  });

  await Promise.all(animations.map(finished));

  // Hub goes hidden again (the folder is the window now), then drop leftover fills.
  delete root.dataset.folderTransition;
  animations.forEach((animation) => animation.cancel());
  stage.style.transformOrigin = '';
}

async function runClose(update: () => void, id: InterestId | null) {
  const stage = document.querySelector<HTMLElement>(STAGE_SELECTOR);
  const win = document.querySelector<HTMLElement>(WINDOW_SELECTOR);
  const iconEl = folderIcon(id);
  const iconRect = iconEl?.getBoundingClientRect();

  if (!stage || !win || !iconEl || !usable(iconRect) || reducedMotion()) {
    update();
    return;
  }

  const root = document.documentElement;
  root.dataset.folderTransition = 'true';
  setStageOrigin(stage, iconRect);
  playSfx('close');

  const winRect = win.getBoundingClientRect();
  const { titlebar, rest } = windowParts(win);
  const animations: Animation[] = [];

  animations.push(
    win.animate([{ clipPath: CLIP_FULL }, { clipPath: clipAround(iconRect, winRect) }], {
      duration: CLOSE_MS,
      easing: EASE_IN_OUT,
      fill: 'forwards',
    }),
  );
  // Content fades out fast so the shrinking window never shows squashed text.
  [titlebar, ...rest].forEach((el) => {
    if (!el) return;
    animations.push(el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS * 0.4, easing: 'ease-in', fill: 'forwards' }));
  });
  // Hub comes back from its zoomed-in state.
  animations.push(
    stage.animate(
      [
        { transform: `scale(${HUB_ZOOM})`, opacity: 0 },
        { transform: 'scale(1)', opacity: 1 },
      ],
      { duration: CLOSE_MS, delay: 40, easing: EASE_OUT, fill: 'both' },
    ),
  );

  await Promise.all(animations.map(finished));

  // Swap to the hub while it is already at rest, then clean up in the same frame.
  update();
  delete root.dataset.folderTransition;
  stage.getAnimations().forEach((animation) => animation.cancel());
  stage.style.transformOrigin = '';

  const landed = folderIcon(id);
  if (landed) {
    landed.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)', offset: 0.4 }, { transform: 'scale(1)' }], {
      duration: 340,
      easing: EASE_OUT,
    });
  }
}

// Serialize quick consecutive opens/closes so each transition starts from the
// currently visible state instead of overlapping another one.
export function folderMorph(update: () => void, destination: Destination, id: InterestId | null): Promise<void> {
  const start = () => (destination === 'folder' ? runOpen(update, id) : runClose(update, id));
  running = (running ?? Promise.resolve()).then(start, start);
  return running;
}
