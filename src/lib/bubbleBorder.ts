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
  var k = Math.max(H / 22, 0.78), list: Bubble[] = [], body: Bubble[] = [];
  // Timing is exactly as before: each bubble has its own tick rate, offset, breathing period and pop cycle.
  function make(cx: number, cy: number, rx: number, ry: number, pop: boolean, amp: number, into: Bubble[] | null): Bubble {
    var b: Bubble = {
      kind: 0, cx: cx, cy: cy, rx: rx, ry: ry,
      tick: R(160, 950), off: R(0, 20000),
      period: R(2200, 9000), phase: R(0, TAU), amp: amp,
      pop: pop, span: R(5000, 15000), dead: R(0.12, 0.3)
    };
    list.push(b); if (into) into.push(b); return b;
  }
  var maxBottom = H - 3.4 * k;
  // lowest pink row per column of everything in `body` (at full breathing size)
  function profile(): number[] {
    var low: number[] = [], c0: number, i: number, p: Bubble, dx: number, bot: number, w: number;
    for (c0 = 0; c0 < WRAP; c0++) low.push(0);
    for (i = 0; i < body.length; i++) {
      p = body[i];
      for (c0 = Math.floor(p.cx - p.rx * 1.2); c0 <= Math.ceil(p.cx + p.rx * 1.2); c0++) {
        dx = (c0 + 0.5 - p.cx) / (p.rx * 1.2);
        if (Math.abs(dx) > 1) continue;
        bot = p.cy + p.ry * 1.2 * Math.sqrt(1 - dx * dx); w = ((c0 % WRAP) + WRAP) % WRAP;
        if (bot > low[w]) low[w] = bot;
      }
    }
    return low;
  }
  var x: number, r: number, i: number, p: Bubble, a: number, rr: number, low: number[], w: number;
  // 1) solid mass: wide overlapping round domes hanging from the bar (their rim is hidden by the puffs below)
  x = R(0, 3);
  while (x < WRAP - 2) {
    r = R(3, 4.2) * k;
    make(x, Math.min(r * R(0.8, 1.05), 3 + 0.7 * r), r * R(1, 1.12), r, false, R(0.06, 0.14), body);
    x += r * R(1.2, 1.6);
  }
  // 2) big round puffs along the lower edge: chunky cumulus scallops with clear round bottoms and valleys
  low = profile(); var puffs: Bubble[] = [];
  x = R(0, 4);
  while (x < WRAP - 2) {
    rr = R(4.6, 7) * k;
    puffs.push(make(x, Math.min(9 * k + R(-1.5, 2.2) * k, maxBottom - rr * 1.2), rr * R(1, 1.1), rr, rnd() < 0.25, R(0.1, 0.2), body));
    x += rr * R(1.8, 2.15);
  }
  // 3) small round beads hanging off some puffs
  for (i = 0; i < puffs.length; i++) {
    if (rnd() > 0.5) continue;
    p = puffs[i]; a = R(Math.PI * 0.3, Math.PI * 0.7); rr = p.ry * R(0.4, 0.55);
    if (rr < 1.5 * k) continue;
    var bcx = p.cx + Math.cos(a) * p.rx * 0.85, bcy = p.cy + Math.sin(a) * p.ry * 0.85;
    if (bcy + rr * 1.25 > maxBottom + 0.5 * k) continue;
    make(bcx, bcy, rr, rr, rnd() < 0.5, R(0.12, 0.24), body);
  }
  // 4) only a handful of clean round bubbles floating just past the edge
  low = profile();
  var placed: Bubble[] = [], tries: number, f: number, fr: number, fcx: number, fcy: number, ok: boolean, c0: number, lo: number;
  for (tries = 0; tries < 80 && placed.length < Math.round(WRAP / 28); tries++) {
    fr = R(1.8, 3) * Math.max(k, 0.8); fcx = R(0, WRAP);
    lo = 0; for (c0 = Math.floor(fcx - fr * 1.5); c0 <= Math.ceil(fcx + fr * 1.5); c0++) lo = Math.max(lo, low[((c0 % WRAP) + WRAP) % WRAP]);
    fcy = lo + 2 + fr * 1.3 + R(0, 1.2);
    if (fcy + fr * 1.3 > H - 1.6) continue;
    ok = true; for (f = 0; f < placed.length; f++) if (Math.abs(placed[f].cx - fcx) < 10) ok = false;
    if (!ok) continue;
    placed.push(make(fcx, fcy, fr, fr, rnd() < 0.7, R(0.14, 0.26), null));
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
      rx = b.rx * s; ry = b.ry * s; 
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
