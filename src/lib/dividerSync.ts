// The dither dividers on the Main tab shimmer on a fixed 4.8s loop (8 frames of 600ms).
// The phase comes from the wall clock rather than from "when this element mounted", so every page
// that draws them (the app, the 404 morph) shows the same frame at the same moment and the
// shimmer carries on across a page change instead of restarting.
const SHIMMER_MS = 4800;

// Passed straight to `ref` (stable identity => runs once on mount, never on re-render).
export function syncDividerPhase(root: HTMLElement | null) {
  if (!root) return;
  const delay = `-${Date.now() % SHIMMER_MS}ms`;
  root.querySelectorAll<HTMLElement>(':scope > i').forEach((el) => {
    el.style.animationDelay = delay;
  });
}
