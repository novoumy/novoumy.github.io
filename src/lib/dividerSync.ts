// The pixel dividers on the Main tab march on a fixed 3.6s loop (gems twinkle on 1.6s).
// Their phase is derived from the wall clock rather than from "when this element mounted",
// so any page that draws them (the app, the 404 morph) shows the same frame at the same moment
// and the animation carries on across a page change instead of restarting.
const MARCH_MS = 3600;
const TWINKLE_MS = 1600;

// Passed straight to `ref` (stable identity => runs once on mount, never on re-render).
export function syncDividerPhase(root: HTMLElement | null) {
  if (!root) return;
  const now = Date.now();
  const march = `-${now % MARCH_MS}ms`;
  const twinkle = `-${now % TWINKLE_MS}ms`;
  root.querySelectorAll<HTMLElement>('.pd-fill, .pd-line').forEach((el) => {
    el.style.animationDelay = march;
  });
  root.querySelectorAll<HTMLElement>('.pd-gems').forEach((el) => {
    el.style.animationDelay = `${march}, ${twinkle}`;
  });
}
