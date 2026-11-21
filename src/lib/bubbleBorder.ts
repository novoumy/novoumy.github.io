// Organic bubble-cluster border for the Main tab (see main.css). Every bubble has its own tick rate, phase,
// breathing period and pop cycle, all derived from the wall clock, so nothing updates in lock-step.
// KEEP IN SYNC with the inline copy in public/404.html (the 404 morph page draws the same border).
type Bubble = { kind: 0 | 1; cx: number; cy: number; rx: number; ry: number; tick: number; off: number; period: number; phase: number; amp: number; pop: boolean; span: number; dead: number };
var PX = 4, WRAP = 256, TAU = Math.PI * 2;
function mulberry32(a: number) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const bubbleSets: Record<string, Bubble[]> = {};
function makeBubbles(H: number, seed: number): Bubble[] {
  var key = H + ':' + seed;
  if (bubbleSets[key]) return bubbleSets[key];
  var rnd = mulberry32(seed * 7919 + H), R = function (a: number, b: number) { return a + rnd() * (b - a); };
  var a1 = R(0, TAU), a2 = R(0, TAU), a3 = R(0, TAU);
  var reach = function (x: number) { // tileable "how deep the cloud hangs here" in rows
    var d = 0.64 + 0.2 * Math.sin(TAU * 7 * x / WRAP + a1) + 0.17 * Math.sin(TAU * 13 * x / WRAP + a2) + 0.1 * Math.sin(TAU * 29 * x / WRAP + a3);
    return 5 + Math.max(0.15, Math.min(1, d)) * (H - 6);
  };
  var list: Bubble[] = [];
  function make(kind: 0 | 1, cx: number, cy: number, rx: number, ry: number, popChance: number) {
    var pop = rnd() < popChance;
    list.push({
      kind: kind, cx: cx, cy: cy, rx: rx, ry: ry,
      tick: R(160, 950), off: R(0, 20000),           // each bubble steps on its own clock
      period: R(2200, 9000), phase: R(0, TAU), amp: R(0.12, 0.34),
      pop: pop, span: R(5000, 15000), dead: R(0.12, 0.3)
    });
  }
  var shape = function (r: number) { return [r * (rnd() < 0.5 ? 1 : R(1.25, 1.9)), r * (rnd() < 0.3 ? R(0.65, 0.85) : 1)]; };
  var i: number, n: number, r: number, s: number[], cx: number, cy: number, maxB: number, bottom: number;
  // body: fat overlapping bubbles through the whole depth of the cloud
  n = Math.round(WRAP * H / 22);
  for (i = 0; i < n; i++) {
    cx = R(0, WRAP); r = R(2.0, 3.8); s = shape(r); maxB = reach(cx);
    cy = R(2.5, Math.max(3, maxB - s[1]));
    make(0, cx, cy, s[0], s[1], 0.15);
  }
  // rim: bubbles whose bottoms sit right on the profile, so the lower edge is a scalloped cloud
  n = Math.round(WRAP / 2.4);
  for (i = 0; i < n; i++) {
    cx = R(0, WRAP); r = R(1.3, 3.4); s = shape(r); maxB = reach(cx);
    bottom = maxB + 1 - Math.pow(rnd(), 1.6) * 3.2; cy = bottom - s[1];
    if (cy < 2.5) continue;
    make(0, cx, cy, s[0], s[1], 0.5);
  }
  // cream bubbles carved out of the pink body
  n = Math.round(WRAP * H / 30);
  for (i = 0; i < n; i++) {
    cx = R(0, WRAP); r = R(1.1, 2.7); s = shape(r); maxB = reach(cx);
    cy = R(5, Math.max(5.5, maxB * 0.75));
    if (cy - s[1] < 3.2) continue;
    make(1, cx, cy, s[0], s[1], 0.5);
  }
  bubbleSets[key] = list;
  return list;
}
function scaleAt(b: Bubble, now: number) {
  var t = Math.floor((now + b.off) / b.tick) * b.tick;
  var s = 1 + b.amp * Math.sin(TAU * t / b.period + b.phase);
  if (b.pop) {
    var u = (t % b.span) / b.span, e: number;
    if (u < 0.14) e = u / 0.14; else if (u < 1 - b.dead - 0.1) e = 1; else if (u < 1 - b.dead) e = (1 - b.dead - u) / 0.1; else e = 0;
    s *= Math.round(e * 4) / 4;
  }
  return s;
}
function fillGrid(grid: Uint8Array, cols: number, H: number, seed: number, now: number) {
  var list = makeBubbles(H, seed), tiles = Math.ceil(cols / WRAP), L: number, k: number, b: Bubble, s: number, rx: number, ry: number, sh: number, y: number, x: number, x0: number, x1: number, y0: number, y1: number, px: number, py: number;
  grid.fill(0);
  for (L = 0 as number; L < 2; L++) {
    for (k = 0; k < list.length; k++) {
      b = list[k]; if (b.kind !== L) continue;
      s = scaleAt(b, now); if (s < 0.3) continue;
      rx = b.rx * s; ry = b.ry * s; if (b.kind === 0) ry = Math.min(ry, H - 1.2 - b.cy);
      if (rx < 0.8 || ry < 0.8) continue;
      y0 = Math.max(0, Math.floor(b.cy - ry)); y1 = Math.min(H - 1, Math.ceil(b.cy + ry));
      for (sh = -1; sh <= tiles; sh++) {
        var cx = b.cx + sh * WRAP;
        x0 = Math.max(0, Math.floor(cx - rx)); x1 = Math.min(cols - 1, Math.ceil(cx + rx));
        for (y = y0; y <= y1; y++) {
          py = (y + 0.5 - b.cy) / ry;
          for (x = x0; x <= x1; x++) {
            px = (x + 0.5 - cx) / rx;
            if (px * px + py * py <= 1) grid[y * cols + x] = b.kind === 0 ? 1 : 0;
          }
        }
      }
    }
  }
  var top = Math.max(3, Math.round(H * 0.19));
  for (y = 0; y < top; y++) for (x = 0; x < cols; x++) grid[y * cols + x] = 1;   // buries the bar's straight edge
  for (x = 0; x < cols; x++) grid[(H - 1) * cols + x] = 0;                        // never a flat cutoff on the cream side
}

type Item = { canvas: HTMLCanvasElement; seed: number; ctx: CanvasRenderingContext2D | null; grid: Uint8Array | null; color: string };
let registry: Item[] = [], running = false, lastDraw = 0, tickCount = 0;
function drawOne(item: Item, now: number) {
  var c = item.canvas, parent = c.parentElement; if (!parent) return;
  var cols = Math.max(1, Math.ceil(parent.clientWidth / PX)), H = Math.max(6, Math.round(parent.clientHeight / PX));
  if (!cols || !parent.clientHeight) return;
  if (c.width !== cols || c.height !== H) { c.width = cols; c.height = H; c.style.width = cols * PX + 'px'; c.style.height = H * PX + 'px'; item.grid = new Uint8Array(cols * H); }
  if (!item.grid) return;
  if (!item.ctx) item.ctx = c.getContext('2d');
  var ctx = item.ctx; if (!ctx) return;
  if (!item.color || tickCount % 40 === 0) { try { item.color = getComputedStyle(c).color; } catch (e) { item.color = '#dfb5b5'; } }
  fillGrid(item.grid, cols, H, item.seed, now);
  ctx.clearRect(0, 0, cols, H);
  ctx.fillStyle = item.color;
  for (var y = 0; y < H; y++) {
    var x = 0;
    while (x < cols) {
      if (item.grid![y * cols + x]) { var x0 = x; while (x < cols && item.grid![y * cols + x]) x++; ctx.fillRect(x0, y, x - x0, 1); } else x++;
    }
  }
}
function loop(ts: number) {
  registry = registry.filter(function (it) { return it.canvas.isConnected; });
  if (!registry.length) { running = false; return; }
  if (ts - lastDraw >= 33) {
    lastDraw = ts; tickCount++;
    var now = Date.now();
    for (var i = 0; i < registry.length; i++) drawOne(registry[i], now);
  }
  requestAnimationFrame(loop);
}
// Every bubble's size is a pure function of the wall clock (Date.now), so the real page and the 404 morph page
// show exactly the same bubbles at the same moment: no restart, snap or jump when one hands over to the other.
export function mountBubbleBorder(canvas: HTMLCanvasElement, position: 'top' | 'bottom') {
  var item: Item = { canvas: canvas, seed: position === 'bottom' ? 2 : 1, ctx: null, grid: null, color: '' };
  registry.push(item);
  drawOne(item, Date.now());
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!still && !running) { running = true; requestAnimationFrame(loop); }
  return function () { registry = registry.filter(function (it) { return it !== item; }); };
}
