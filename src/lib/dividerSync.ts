// Pixel-dither dividers on the Main tab.
//
// Shape: ordered (Bayer 4x4) dither of the status-bar pink fading into the cream window. The reach of the
// pink is a periodic sum of sines along the width ("rolling dunes"), so it fades deeper in some places and
// shallower in others, and the 640px tile repeats without a visible join.
//
// Motion: the sprite holds 4 frames whose thresholds are nudged by -1/0/+1; only pixels sitting on the
// threshold flip, so the dither twinkles in place. Each frame is followed by 2 empty spacer rows so
// sub-pixel offsets can never pull the next frame's solid top row in as a hard line.
//
// Sync: the loop phase comes from the wall clock, not from when an element mounted, so every page that
// draws the dividers (this app and the 404 morph in public/404.html, which repeats this maths) shows the
// same frame at the same moment. Keep the two copies in step.
const COLS = 160; // 160 cells x 4px = 640px tile
const SHIFTS = [0, 1, 0, -1];
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const LOOP_MS = 2400;

function depthProfile(lo: number, hi: number): number[] {
  const raw: number[] = [];
  for (let c = 0; c < COLS; c++) {
    const t = (c / COLS) * 2 * Math.PI;
    raw.push(Math.sin(t + 0.7) + 0.38 * Math.sin(2 * t + 2.2) + 0.2 * Math.sin(3 * t + 4.1));
  }
  const min = Math.min(...raw);
  const max = Math.max(...raw);
  return raw.map((v) => lo + ((hi - lo) * (v - min)) / (max - min));
}

function buildSprite(rows: number, minRows: number): string {
  const stride = rows + 2;
  const depth = depthProfile(minRows, rows);
  let d = '';
  for (let k = 0; k < SHIFTS.length; k++) {
    for (let r = 0; r < rows; r++) {
      const on = (col: number) =>
        r === 0 || (BAYER[r % 4][col % 4] + SHIFTS[k] + 16) % 16 < Math.max(0, 1 - r / depth[col]) * 16;
      let c = 0;
      while (c < COLS) {
        if (on(c)) {
          const start = c;
          while (c < COLS && on(c)) c++;
          d += `M${start} ${k * stride + r}h${c - start}v1h-${c - start}z`;
        } else {
          c++;
        }
      }
    }
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COLS} ${stride * SHIFTS.length}" ` +
    `width="${COLS * 4}" height="${stride * SHIFTS.length * 4}" shape-rendering="crispEdges"><path d="${d}"/></svg>`;
  return URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
}

let spritesReady = false;
function ensureSprites() {
  if (spritesReady) return;
  spritesReady = true;
  const root = document.documentElement.style;
  root.setProperty('--pd-sprite-tall', `url("${buildSprite(12, 6)}")`);
  root.setProperty('--pd-sprite-short', `url("${buildSprite(8, 4)}")`);
}

// Passed straight to `ref` (stable identity => runs once on mount, never on re-render).
export function syncDividerPhase(root: HTMLElement | null) {
  if (!root) return;
  ensureSprites();
  const delay = `-${Date.now() % LOOP_MS}ms`;
  root.querySelectorAll<HTMLElement>(':scope > i').forEach((el) => {
    el.style.animationDelay = delay;
  });
}
