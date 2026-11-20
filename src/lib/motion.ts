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

// Tab swap: the new panel is revealed by a circular wipe that radiates from the tab that was clicked,
// with a slight slide + de-blur, while its content blocks pop in one after another.
// direction: 1 = moving right, -1 = moving left, 0 = first load. originX = click position (0-100, % of window width).
export function animatePanelIn(panel: HTMLElement, direction: number, originX = 50) {
  if (reducedMotion()) return;
  panel.getAnimations().forEach((animation) => animation.cancel());
  panel.animate(
    [
      {
        opacity: 0,
        transform: `translateX(${direction * 38}px) scale(0.985)`,
        filter: 'blur(6px) saturate(1.4)',
        clipPath: `circle(0% at ${originX}% 0%)`,
      },
      {
        opacity: 1,
        transform: 'translateX(0) scale(1)',
        filter: 'blur(0) saturate(1)',
        clipPath: `circle(150% at ${originX}% 0%)`,
      },
    ],
    { duration: 620, easing: EASE_OUT },
  );

  staggerTargets(panel).forEach((el, index) => {
    el.getAnimations().forEach((animation) => animation.cancel());
    el.animate(
      [
        { opacity: 0, transform: `translate(${direction * 16}px, 22px) scale(0.95)`, filter: 'blur(3px)' },
        { opacity: 1, transform: 'translate(0, 0) scale(1)', filter: 'blur(0)' },
      ],
      { duration: 560, delay: 110 + index * 55, easing: EASE_OUT, fill: 'backwards' },
    );
  });
}
