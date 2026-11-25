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
  var k = Math.max(H / 22, 0.78), list: Bubble[] = [];
  // Timing is exactly as before: each bubble has its own tick rate, offset, breathing period and pop cycle.
  function make(cx: number, cy: number, rx: number, ry: number, pop: boolean, amp: number): Bubble {
    var b: Bubble = {
      kind: 0, cx: cx, cy: cy, rx: rx, ry: ry,
      tick: R(160, 950), off: R(0, 20000),
      period: R(2200, 9000), phase: R(0, TAU), amp: amp,
      pop: pop, span: R(5000, 15000), dead: R(0.12, 0.3)
    };
    list.push(b); return b;
  }
  var limit = H - 2.2;                       // nothing ever reaches the empty bottom row, even at full breathing size
  var fits = function (cy: number, ry: number, amp: number) { return cy + ry * (1 + amp) <= limit; };
  var i: number, j: number, p: Bubble, a: number, rr: number, amp: number, hills: Bubble[] = [], lumps: Bubble[] = [], beads: Bubble[] = [];
  // 1) rolling hills: big half-domes rooted on the bar line (centres sit inside the solid top band, so only the
  //    lower half shows, like a semicircle growing out of the bar). Heavily overlapped; radii vary for rhythm.
  var x = R(0, 3), r = R(6, 10) * k, nr: number;
  while (x < WRAP + 6) {
    amp = R(0.07, 0.13);
    var cy = R(2, 3.6);
    while (!fits(cy, r, amp) && r > 3) r *= 0.9;
    hills.push(make(x, cy, r * R(1, 1.08), r, false, amp));
    nr = R(6, 10) * k;
    x += (r + nr) * R(0.9, 1.05);
    r = nr;
  }
  // 2) puffy lumps centred just inside each hill's rim, so they stay fused to it and give a cumulus outline
  for (i = 0; i < hills.length; i++) {
    p = hills[i];
    var n = rnd() < 0.8 ? 3 : 2;
    for (j = 0; j < n; j++) {
      a = R(Math.PI * 0.1, Math.PI * 0.9); rr = p.ry * R(0.36, 0.58); amp = R(0.1, 0.2);
      var lx = p.cx + Math.cos(a) * p.rx * 0.93, ly = p.cy + Math.sin(a) * p.ry * 0.93;
      if (!fits(ly, rr, amp)) continue;
      lumps.push(make(lx, ly, rr, rr, rnd() < 0.4, amp));
    }
  }
  // 3) small round beads on some lumps, also rooted in their parent
  for (i = 0; i < lumps.length; i++) {
    if (rnd() > 0.45) continue;
    p = lumps[i]; a = R(Math.PI * 0.2, Math.PI * 0.8); rr = p.ry * R(0.42, 0.58); amp = R(0.12, 0.24);
    if (rr < 1.4 * k) continue;
    var bx = p.cx + Math.cos(a) * p.rx * 0.88, by = p.cy + Math.sin(a) * p.ry * 0.88;
    if (!fits(by, rr, amp)) continue;
    p.pop = false;   // a puff that carries a bead never pops, so the bead can't be left floating
    beads.push(make(bx, by, rr, rr, rnd() < 0.55, amp));
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

// Band tint. The status bar and the waves are painted by the SAME canvas in ONE pass, from one horizontal gradient
// at one alpha (every pixel is written exactly once, nothing stacks), so there is no seam or colour step where the
// bar turns into waves. The bars in main.css are transparent; the glass behind shows through identically.
// KEEP IN SYNC with the inline copy in public/404.html.
var BAND_EDGE = [225, 212, 255, 0.45], BAND_MID = [205, 185, 255, 0.6], BAND_RIM = [168, 145, 230, 0.7];

type Item = { canvas: HTMLCanvasElement; seed: number; position: 'top' | 'bottom'; ctx: CanvasRenderingContext2D | null; grid: Uint8Array | null; img: ImageData | null; cols: number; rows: number; band: Uint8ClampedArray | null; rim: Uint8ClampedArray; w: number; h: number; barH: number; dirty: boolean; ro: ResizeObserver | null };
let registry: Item[] = [], running = false, lastDraw = 0;
function rgba(c: number[]) { return [c[0], c[1], c[2], Math.round(c[3] * 255)]; }
// Sizes are measured only when a ResizeObserver says they changed (reading clientWidth/clientHeight every frame
// forces a synchronous layout, which is very expensive on phones).
function measure(item: Item) {
  var parent = item.canvas.parentElement; if (!parent) return;
  var bar = item.position === 'top' ? parent.previousElementSibling : parent.nextElementSibling;
  item.w = parent.clientWidth; item.h = parent.clientHeight; item.barH = bar ? bar.clientHeight : 0; item.dirty = false;
}
function drawOne(item: Item, now: number) {
  var c = item.canvas, parent = c.parentElement; if (!parent) return;
  if (item.dirty) measure(item);
  var barH = item.barH, barRows = Math.round(barH / PX);
  if (!item.w || !item.h) return;   // hidden tab: nothing to draw
  var cols = Math.max(1, Math.ceil(item.w / PX)), H = Math.max(6, Math.round(item.h / PX));
  var rows = barRows + H;
  if (!item.img || item.cols !== cols || item.rows !== rows) {
    item.cols = cols; item.rows = rows;
    c.width = cols; c.height = rows;
    c.style.width = cols * PX + 'px'; c.style.height = barH + H * PX + 'px'; c.style.top = -barH + 'px';
    item.grid = new Uint8Array(cols * H);
    item.ctx = c.getContext('2d'); if (!item.ctx) return;
    item.img = item.ctx.createImageData(cols, rows);
    var band = new Uint8ClampedArray(cols * 4);
    for (var x = 0; x < cols; x++) {
      var t = (x + 0.5) / cols, u = (t < 0.5 ? t : 1 - t) * 2;
      for (var k = 0; k < 4; k++) band[x * 4 + k] = BAND_EDGE[k] + (BAND_MID[k] - BAND_EDGE[k]) * u;
      band[x * 4 + 3] = Math.round((BAND_EDGE[3] + (BAND_MID[3] - BAND_EDGE[3]) * u) * 255);
    }
    item.band = band;
  }
  if (!item.grid || !item.ctx || !item.img || !item.band) return;
  fillGrid(item.grid, cols, H, item.seed, now);
  var d = item.img.data, g = item.grid, band2 = item.band, rim = item.rim;
  for (var y = 0; y < rows; y++) {
    var gy = y - barRows;
    for (var x2 = 0; x2 < cols; x2++) {
      var o = (y * cols + x2) * 4, src: ArrayLike<number> | null = null, so = 0;
      if (gy < 0 || g[gy * cols + x2]) {
        // lower edge of every wave gets the one-pixel deeper rim; the bar itself never does
        if (gy >= 0 && (gy === H - 1 || !g[(gy + 1) * cols + x2])) src = rim; else { src = band2; so = x2 * 4; }
      }
      if (src) { d[o] = src[so]; d[o + 1] = src[so + 1]; d[o + 2] = src[so + 2]; d[o + 3] = src[so + 3]; }
      else { d[o] = d[o + 1] = d[o + 2] = d[o + 3] = 0; }
    }
  }
  item.ctx.putImageData(item.img, 0, 0);
}
function loop(ts: number) {
  if (ts - lastDraw >= 66) {   // ~15fps: the bubbles tick every 160-950ms, so more redraws change nothing
    lastDraw = ts;
    registry = registry.filter(function (it) { return it.canvas.isConnected; });
    if (!registry.length) { running = false; return; }
    var now = Date.now();
    for (var i = 0; i < registry.length; i++) drawOne(registry[i], now);
  }
  requestAnimationFrame(loop);
}
// Every bubble's size is a pure function of the wall clock (Date.now), so the real page and the 404 morph page
// show exactly the same bubbles at the same moment: no restart, snap or jump when one hands over to the other.
export function mountBubbleBorder(canvas: HTMLCanvasElement, position: 'top' | 'bottom') {
  var item: Item = { canvas: canvas, seed: position === 'bottom' ? 2 : 1, position: position, ctx: null, grid: null, img: null, cols: 0, rows: 0, band: null, rim: new Uint8ClampedArray(rgba(BAND_RIM)), w: 0, h: 0, barH: 0, dirty: true, ro: null };
  registry.push(item);
  var parentEl = canvas.parentElement;
  if (parentEl && typeof ResizeObserver !== 'undefined') {
    item.ro = new ResizeObserver(function () { item.dirty = true; });
    item.ro.observe(parentEl);
    var barEl = position === 'top' ? parentEl.previousElementSibling : parentEl.nextElementSibling;
    if (barEl) item.ro.observe(barEl);
  }
  drawOne(item, Date.now());
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!still && !running) { running = true; requestAnimationFrame(loop); }
  return function () { if (item.ro) item.ro.disconnect(); registry = registry.filter(function (it) { return it !== item; }); };
}
