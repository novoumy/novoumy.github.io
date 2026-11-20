// A CRT-style power cycle used only when opening or closing an Interests folder.
// The main window collapses to a glowing centre line, the route updates, and the
// destination window expands from that same line. No page snapshots are cross-faded.
type Destination = 'folder' | 'hub';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let running: Promise<void> | null = null;

const nextFrame = () => new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

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
  const hubSelector = 'section[data-compact], .win-section';
  const source =
    document.querySelector<HTMLElement>('.r-window') ??
    document.querySelector<HTMLElement>(hubSelector);

  if (!source || reducedMotion()) {
    if (destination === 'hub') {
      document.querySelector<HTMLElement>(hubSelector)?.classList.remove('crt-collapsed');
    }
    update();
    return;
  }

  const root = document.documentElement;
  root.dataset.crtTransition = 'true';

  const beam = document.createElement('div');
  beam.className = 'crt-folder-beam';
  positionBeam(beam, source);
  document.body.appendChild(beam);

  try {
    source.classList.add('crt-screen');

    const collapse = source.animate(
      [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.004)' }],
      {
        duration: 270,
        easing: 'cubic-bezier(0.68, 0, 0.84, 0)',
        fill: 'forwards',
      },
    );
    const beamOn = beam.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 150,
      delay: 115,
      easing: 'ease-out',
      fill: 'forwards',
    });

    await Promise.all([finished(collapse), finished(beamOn)]);

    // Keep the Interests hub folded behind the folder until it is closed again.
    if (!source.matches('.r-window') && destination === 'folder') {
      source.classList.add('crt-collapsed');
    }
    collapse.cancel();
    source.classList.remove('crt-screen');

    update();
    await nextFrame();

    const target =
      destination === 'folder'
        ? document.querySelector<HTMLElement>('.r-window')
        : document.querySelector<HTMLElement>(hubSelector);

    if (!target) {
      source.classList.remove('crt-collapsed');
      document.querySelector<HTMLElement>(hubSelector)?.classList.remove('crt-collapsed');
      return;
    }

    target.classList.add('crt-screen');
    if (destination === 'hub') target.classList.add('crt-collapsed');
    positionBeam(beam, target);

    const expand = target.animate(
      [{ transform: 'scaleY(0.004)' }, { transform: 'scaleY(1)' }],
      {
        duration: 410,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards',
      },
    );
    const beamOff = beam.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 210,
      delay: 45,
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
