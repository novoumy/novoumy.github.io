// Small Web Animations helpers so tabs can stay mounted (no remount) and still animate.

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

// Elements to stagger: the panel's top-level blocks, expanding any [data-stagger] list into its items.
function staggerTargets(panel: HTMLElement): HTMLElement[] {
  const root = panel.firstElementChild;
  if (!root) return [];
  const out: HTMLElement[] = [];
  for (const child of Array.from(root.children)) {
    // Backgrounds / frame pieces (bars, dividers) stay put so the window is fully drawn from the first frame.
    if (child.hasAttribute('data-static')) continue;
    if (child.hasAttribute('data-stagger')) out.push(...(Array.from(child.children) as HTMLElement[]));
    else out.push(child as HTMLElement);
  }
  return out.slice(0, 14);
}

// direction: 1 = moving right, -1 = moving left, 0 = first load.
export function animatePanelIn(panel: HTMLElement, direction: number) {
  if (reducedMotion()) return;
  panel.getAnimations().forEach((animation) => animation.cancel());
  // Main is a frosted-glass window (backdrop-filter). Any opacity / filter / transform on the panel or on its
  // top-level block makes Chrome drop the blur (gray flash) and re-parents its absolute layout (shifted + scrollbar)
  // until the animation ends, so Main is never animated: it appears fully drawn on the first frame.
  if (panel.hasAttribute('data-no-fade')) return;
  // Panels with an opaque full-window background (Main) must not fade/slide as a whole: the dark window
  // behind would show through and flash gray until the fade finishes.
  if (!panel.hasAttribute('data-no-fade')) {
    const offset = direction * 28;
    panel.animate(
      [
        { opacity: 0, transform: `translateX(${offset}px)`, filter: 'blur(2px)' },
        { opacity: 1, transform: 'translateX(0)', filter: 'blur(0)' },
      ],
      { duration: 380, easing: EASE_OUT },
    );
  }

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

// Smooth power-off on the open folder overlay, then resolves so it can unmount.
export function closeOverlayAnimated(): Promise<void> {
  const overlay = document.querySelector<HTMLElement>('.animate-overlay-in');
  if (!overlay || reducedMotion()) return Promise.resolve();
  overlay.closest<HTMLElement>('.r-desk')?.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 420,
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
    fill: 'forwards',
  });
  const animation = overlay.animate(
    [
      { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)' },
      { opacity: 0, transform: 'translateY(14px) scale(0.985)', filter: 'blur(1px)' },
    ],
    { duration: 420, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' },
  );
  return animation.finished.then(
    () => undefined,
    () => undefined,
  );
}
