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

type Item = { canvas: HTMLCanvasElement; seed: number; ctx: CanvasRenderingContext2D | null; grid: Uint8Array | null; color: string; rim: string };
let registry: Item[] = [], running = false, lastDraw = 0, tickCount = 0;
function drawOne(item: Item, now: number) {
  var c = item.canvas, parent = c.parentElement; if (!parent) return;
  var cols = Math.max(1, Math.ceil(parent.clientWidth / PX)), H = Math.max(6, Math.round(parent.clientHeight / PX));
  if (!cols || !parent.clientHeight) return;
  if (c.width !== cols || c.height !== H) { c.width = cols; c.height = H; c.style.width = cols * PX + 'px'; c.style.height = H * PX + 'px'; item.grid = new Uint8Array(cols * H); }
  if (!item.grid) return;
  if (!item.ctx) item.ctx = c.getContext('2d');
  var ctx = item.ctx; if (!ctx) return;
  if (!item.color || tickCount % 40 === 0) { try { var cs = getComputedStyle(c); item.color = cs.color; item.rim = cs.borderTopColor || item.color; } catch (e) { item.color = '#D6C9F8'; item.rim = '#A891E6'; } }
  fillGrid(item.grid, cols, H, item.seed, now);
  ctx.clearRect(0, 0, cols, H);
  ctx.fillStyle = item.color;
  for (var y = 0; y < H; y++) {
    var x = 0;
    while (x < cols) {
      if (item.grid![y * cols + x]) { var x0 = x; while (x < cols && item.grid![y * cols + x]) x++; ctx.fillRect(x0, y, x - x0, 1); } else x++;
    }
  }
  // a one-pixel deeper-pink rim along every lower edge gives the puffs depth
  ctx.fillStyle = item.rim;
  for (var ry = 0; ry < H; ry++) {
    var rx = 0;
    while (rx < cols) {
      if (item.grid![ry * cols + rx] && (ry === H - 1 || !item.grid![(ry + 1) * cols + rx])) { var r0 = rx; while (rx < cols && item.grid![ry * cols + rx] && (ry === H - 1 || !item.grid![(ry + 1) * cols + rx])) rx++; ctx.fillRect(r0, ry, rx - r0, 1); } else rx++;
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
  var item: Item = { canvas: canvas, seed: position === 'bottom' ? 2 : 1, ctx: null, grid: null, color: '', rim: '' };
  registry.push(item);
  drawOne(item, Date.now());
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!still && !running) { running = true; requestAnimationFrame(loop); }
  return function () { registry = registry.filter(function (it) { return it !== item; }); };
}
