// Small Web Animations helpers so tabs can stay mounted (no remount) and still animate.

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

// Elements to stagger: the panel's top-level blocks, expanding any [data-stagger] list into its items.
function staggerTargets(panel: HTMLElement): HTMLElement[] {
  const root = panel.firstElementChild;
  if (!root) return [];
  const out: HTMLElement[] = [];
  for (const child of Array.from(root.children)) {
    if (child.hasAttribute('data-stagger')) out.push(...(Array.from(child.children) as HTMLElement[]));
    else out.push(child as HTMLElement);
  }
  return out.slice(0, 14);
}

// direction: 1 = moving right, -1 = moving left, 0 = first load.
export function animatePanelIn(panel: HTMLElement, direction: number) {
  if (reducedMotion()) return;
  panel.getAnimations().forEach((animation) => animation.cancel());
  const offset = direction * 28;
  panel.animate(
    [
      { opacity: 0, transform: `translateX(${offset}px)`, filter: 'blur(2px)' },
      { opacity: 1, transform: 'translateX(0)', filter: 'blur(0)' },
    ],
    { duration: 380, easing: EASE_OUT },
  );

  staggerTargets(panel).forEach((el, index) => {
    el.getAnimations().forEach((animation) => animation.cancel());
    el.animate(
      [
        { opacity: 0, transform: `translate(${direction * 10}px, 14px) scale(0.97)` },
        { opacity: 1, transform: 'translate(0, 0) scale(1)' },
      ],
      { duration: 420, delay: 60 + index * 45, easing: EASE_OUT, fill: 'backwards' },
    );
  });
}

// CRT "power off" on the open folder overlay, then resolves so it can unmount.
export function closeOverlayAnimated(): Promise<void> {
  const overlay = document.querySelector<HTMLElement>('.animate-overlay-in');
  if (!overlay || reducedMotion()) return Promise.resolve();
  // The lavender desk behind the window fades out as the window collapses.
  overlay.closest<HTMLElement>('.r-desk')?.animate([{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0 }], {
    duration: 260,
    easing: 'ease-in',
    fill: 'forwards',
  });
  const animation = overlay.animate(
    [
      { clipPath: 'inset(0 0 0 0)', filter: 'brightness(1)', opacity: 1 },
      { clipPath: 'inset(48% 0 48% 0)', filter: 'brightness(2.2)', opacity: 1, offset: 0.65 },
      { clipPath: 'inset(50% 40% 50% 40%)', filter: 'brightness(3)', opacity: 0 },
    ],
    { duration: 260, easing: 'cubic-bezier(0.55, 0, 0.75, 0.2)', fill: 'forwards' },
  );
  return animation.finished.then(
    () => undefined,
    () => undefined,
  );
}
