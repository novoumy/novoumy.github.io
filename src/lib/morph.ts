import { playSfx } from '@/audio/sfx';

// A CRT-style power cycle used only when opening or closing an Interests folder.
// The whole hub (tabs + window) collapses together, the route updates at the line,
// and the destination expands in the exact reverse motion. No snapshot cross-fades.
type Destination = 'folder' | 'hub';

const HUB_SELECTOR = '[data-crt-stage]';
const FOLDER_SELECTOR = '.r-window';
const COLLAPSE_DURATION = 430;
const EXPAND_DURATION = 430;
const LINE_HOLD_MS = 185;
const COLLAPSE_EASING = 'cubic-bezier(0.14, 0.82, 0.24, 1)';
// Exact time-reverse of COLLAPSE_EASING: slow at the line, quick in the middle, slow at full size.
const EXPAND_EASING = 'cubic-bezier(0.76, 0, 0.86, 0.18)';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let running: Promise<void> | null = null;

const nextFrame = () => new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
const wait = (duration: number) => new Promise<void>((resolve) => window.setTimeout(resolve, duration));

function positionBeam(beam: HTMLElement, surface: HTMLElement) {
  const rect = surface.getBoundingClientRect();
  beam.style.left = `${rect.left}px`;
  beam.style.top = `${rect.top + rect.height / 2}px`;
  beam.style.width = `${rect.width}px`;
}

function finished(animation: Animation): Promise<void> {
  return animation.finished.then(
    () => undefined,
    () => undefined,
  );
}

async function runCrtTransition(update: () => void, destination: Destination): Promise<void> {
  // The hub selector deliberately includes the tab bar as well as the main window.
  const sourceSelector = destination === 'folder' ? HUB_SELECTOR : FOLDER_SELECTOR;
  const source = document.querySelector<HTMLElement>(sourceSelector);

  if (!source || reducedMotion()) {
    update();
    document.querySelector<HTMLElement>(HUB_SELECTOR)?.classList.remove('crt-screen', 'crt-collapsed');
    document.querySelector<HTMLElement>(FOLDER_SELECTOR)?.classList.remove('crt-screen', 'crt-collapsed');
    return;
  }

  const root = document.documentElement;
  root.dataset.crtTransition = 'true';

  // When powering a folder off, the Interests hub is already mounted behind the
  // portal. Collapse it before the folder starts shrinking, otherwise the full-size
  // hub can flash through the transparent folder desk at the line.
  const preCollapsedDestination = destination === 'hub'
    ? document.querySelector<HTMLElement>(HUB_SELECTOR)
    : null;
  preCollapsedDestination?.classList.add('crt-screen', 'crt-collapsed');

  const beam = document.createElement('div');
  beam.className = 'crt-folder-beam';
  positionBeam(beam, source);
  document.body.appendChild(beam);

  try {
    // Power off: fast at first, then progressively slower as the screen reaches its line.
    playSfx('crt-off');
    source.classList.add('crt-screen');

    const collapse = source.animate(
      [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.004)' }],
      {
        duration: COLLAPSE_DURATION,
        easing: COLLAPSE_EASING,
        fill: 'forwards',
      },
    );
    const beamOn = beam.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 145,
      delay: COLLAPSE_DURATION - 125,
      easing: 'ease-out',
      fill: 'forwards',
    });

    await Promise.all([finished(collapse), finished(beamOn)]);

    // Keep the outgoing surface folded at the line during the hold. This is
    // important for both directions: without it the WAAPI fill disappears when
    // cancel() runs and the folder can briefly spring back to full size.
    source.classList.add('crt-collapsed');
    collapse.cancel();
    source.classList.remove('crt-screen');

    // Let the glowing line hang for a moment before the next screen powers on.
    await wait(LINE_HOLD_MS);
    update();
    await nextFrame();

    const target = document.querySelector<HTMLElement>(destination === 'folder' ? FOLDER_SELECTOR : HUB_SELECTOR);
    if (!target) {
      source.classList.remove('crt-screen', 'crt-collapsed');
      preCollapsedDestination?.classList.remove('crt-screen', 'crt-collapsed');
      document.querySelector<HTMLElement>(HUB_SELECTOR)?.classList.remove('crt-screen', 'crt-collapsed');
      document.querySelector<HTMLElement>(FOLDER_SELECTOR)?.classList.remove('crt-screen', 'crt-collapsed');
      return;
    }

    target.classList.add('crt-screen', 'crt-collapsed');
    // Avoid the folder's usual one-shot fade/clip animation restarting after this CRT cycle.
    target.classList.remove('animate-overlay-in');
    target.closest<HTMLElement>('.r-desk')?.classList.add('crt-powered');
    positionBeam(beam, target);

    // Power on is the reverse of power-off, expanding away from the line with a gentle landing.
    playSfx('crt-on');
    const expand = target.animate(
      [{ transform: 'scaleY(0.004)' }, { transform: 'scaleY(1)' }],
      {
        duration: EXPAND_DURATION,
        easing: EXPAND_EASING,
        fill: 'forwards',
      },
    );
    const beamOff = beam.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 235,
      delay: 85,
      easing: 'ease-out',
      fill: 'forwards',
    });

    await Promise.all([finished(expand), finished(beamOff)]);
    target.classList.remove('crt-screen', 'crt-collapsed');
    expand.cancel();
  } finally {
    beam.remove();
    delete root.dataset.crtTransition;
  }
}

// Serialize quick consecutive folder opens/closes so each transition starts from
// the currently visible window instead of overlapping another power cycle.
export function crtMorph(update: () => void, destination: Destination): Promise<void> {
  const start = () => runCrtTransition(update, destination);
  running = (running ?? Promise.resolve()).then(start, start);
  return running;
}
