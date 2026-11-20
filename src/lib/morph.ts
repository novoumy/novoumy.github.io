import { playSfx } from '@/audio/sfx';
import type { InterestId } from '@/siteData';

// Window morph used when opening / closing an Interests folder.
//
// Opening:  the folder window starts exactly on top of the hub's main window (same
//           rect, same frame) and expands to its full size, so it reads as the main
//           window itself opening up. The hub stays perfectly still behind it. The
//           title bar drops in and the content staggers up as the window finishes.
// Closing:  the reverse - the window contracts back onto the main window's rect.
//
// Only clip-path / opacity / transform are animated, so it stays smooth even with the
// big library views mounted.
type Destination = 'folder' | 'hub';

const STAGE_SELECTOR = '[data-crt-stage]';
const HUB_WINDOW_SELECTOR = '[data-crt-stage] .pixel-frame';
const WINDOW_SELECTOR = '.r-window';
const OPEN_MS = 600;
const CLOSE_MS = 460;
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';
// Negative inset so the pixel-frame box-shadow is never clipped at full size.
const CLIP_FULL = 'inset(-16px)';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let running: Promise<void> | null = null;

const finished = (animation: Animation): Promise<void> =>
  animation.finished.then(
    () => undefined,
    () => undefined,
  );

const usable = (rect: DOMRect | undefined): rect is DOMRect => !!rect && rect.width > 0 && rect.height > 0;

// clip-path that lines the folder window's frame up with `target` (the hub window).
// The frame is drawn with box-shadows (4px on top/left, 8px on bottom/right), so the
// clip is pushed out by those amounts to keep the wine border visible while morphing.
function clipOnto(target: DOMRect, win: DOMRect): string {
  const top = target.top - win.top - 4;
  const left = target.left - win.left - 4;
  const right = win.right - target.right - 8;
  const bottom = win.bottom - target.bottom - 8;
  return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
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

async function runOpen(update: () => void) {
  const stage = document.querySelector<HTMLElement>(STAGE_SELECTOR);
  const hubRect = document.querySelector<HTMLElement>(HUB_WINDOW_SELECTOR)?.getBoundingClientRect();

  if (!stage || !usable(hubRect) || reducedMotion()) {
    update();
    return;
  }

  const root = document.documentElement;
  root.dataset.folderTransition = 'true';
  playSfx('open');

  // The folder is already loaded, so this commits the full window synchronously.
  update();
  const win = document.querySelector<HTMLElement>(WINDOW_SELECTOR);
  if (!win) {
    delete root.dataset.folderTransition;
    return;
  }
  // The window's own one-shot rise animation would fight this one.
  win.classList.remove('animate-overlay-in');

  const startClip = clipOnto(hubRect, win.getBoundingClientRect());
  const { titlebar, rest, items } = windowParts(win);
  const animations: Animation[] = [];

  // Window opens up from the hub window's exact rect.
  animations.push(
    win.animate([{ clipPath: startClip }, { clipPath: CLIP_FULL }], {
      duration: OPEN_MS,
      easing: EASE_OUT,
      fill: 'backwards',
    }),
  );
  // Quick cross-fade so the hub's icons dissolve into the new window instead of snapping.
  animations.push(win.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out', fill: 'backwards' }));
  // The hub stays still behind and only fades once the window has grown over it.
  animations.push(
    stage.animate([{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0 }], {
      duration: OPEN_MS,
      easing: 'linear',
      fill: 'forwards',
    }),
  );

  // Chrome and content arrive as the window finishes opening.
  if (titlebar) {
    animations.push(
      titlebar.animate(
        [
          { opacity: 0, transform: 'translateY(-60%)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 400, delay: 180, easing: EASE_OUT, fill: 'backwards' },
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
        { duration: 420, delay: 220 + index * 50, easing: EASE_OUT, fill: 'backwards' },
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
        { duration: 420, delay: 290 + index * 38, easing: EASE_OUT, fill: 'backwards' },
      ),
    );
  });

  await Promise.all(animations.map(finished));

  // Hub goes hidden again (the folder is the window now), then drop leftover fills.
  delete root.dataset.folderTransition;
  animations.forEach((animation) => animation.cancel());
}

async function runClose(update: () => void, id: InterestId | null) {
  const stage = document.querySelector<HTMLElement>(STAGE_SELECTOR);
  const win = document.querySelector<HTMLElement>(WINDOW_SELECTOR);
  const hubRect = document.querySelector<HTMLElement>(HUB_WINDOW_SELECTOR)?.getBoundingClientRect();

  if (!stage || !win || !usable(hubRect) || reducedMotion()) {
    update();
    return;
  }

  const root = document.documentElement;
  root.dataset.folderTransition = 'true';
  playSfx('close');

  const { titlebar, rest } = windowParts(win);
  const animations: Animation[] = [];

  // Window contracts back onto the hub window, which is already visible and still behind it.
  animations.push(
    win.animate([{ clipPath: CLIP_FULL }, { clipPath: clipOnto(hubRect, win.getBoundingClientRect()) }], {
      duration: CLOSE_MS,
      easing: EASE_IN_OUT,
      fill: 'forwards',
    }),
  );
  // Content fades out fast so the shrinking window never shows squashed text...
  [titlebar, ...rest].forEach((el) => {
    if (!el) return;
    animations.push(el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS * 0.4, easing: 'ease-in', fill: 'forwards' }));
  });
  // ...and the window itself dissolves into the hub at the very end.
  animations.push(
    win.animate([{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], {
      duration: CLOSE_MS,
      easing: 'linear',
      fill: 'forwards',
    }),
  );

  await Promise.all(animations.map(finished));

  // Swap to the hub, which has been sitting fully visible behind the window the whole time.
  update();
  delete root.dataset.folderTransition;

  const landed = id ? document.querySelector<HTMLElement>(`[data-folder-id="${id}"] svg`) : null;
  landed?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)', offset: 0.4 }, { transform: 'scale(1)' }], {
    duration: 340,
    easing: EASE_OUT,
  });
}

// Serialize quick consecutive opens/closes so each transition starts from the
// currently visible state instead of overlapping another one.
export function folderMorph(update: () => void, destination: Destination, id: InterestId | null): Promise<void> {
  const start = () => (destination === 'folder' ? runOpen(update) : runClose(update, id));
  running = (running ?? Promise.resolve()).then(start, start);
  return running;
}
