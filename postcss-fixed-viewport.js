// The site always renders as one fixed-size "stage" that is scaled to fit the screen (see src/lib/useStageScale.ts),
// so the layout must NEVER react to the real window size. This PostCSS plugin makes that true for every
// stylesheet (Tailwind's sm:/md:/max-sm:/min-[860px]: variants and all hand-written @media rules): width/height
// media features are evaluated against a fixed, large "desktop" viewport at build time, so the desktop rules
// always apply and the mobile / small-window rules never do. Non-size queries (hover, pointer,
// prefers-reduced-motion, ...) are left alone.
const VIEWPORT_WIDTH = 2560;
const VIEWPORT_HEIGHT = 1440;

const toPx = (value, unit) => (unit === 'px' ? value : value * 16); // em / rem

// Evaluate one size feature. Returns true / false, or null if it is not a size feature.
function evalFeature(feature) {
  const inner = feature.trim().replace(/^\(|\)$/g, '').trim();
  let m = inner.match(/^(min|max)-(width|height)\s*:\s*([\d.]+)(px|em|rem)$/i);
  if (m) {
    const size = m[2].toLowerCase() === 'width' ? VIEWPORT_WIDTH : VIEWPORT_HEIGHT;
    const limit = toPx(parseFloat(m[3]), m[4].toLowerCase());
    return m[1].toLowerCase() === 'min' ? size >= limit : size <= limit;
  }
  m = inner.match(/^(width|height)\s*(<=|>=|<|>|=)\s*([\d.]+)(px|em|rem)$/i);
  if (m) {
    const size = m[1].toLowerCase() === 'width' ? VIEWPORT_WIDTH : VIEWPORT_HEIGHT;
    const limit = toPx(parseFloat(m[3]), m[4].toLowerCase());
    return { '<=': size <= limit, '>=': size >= limit, '<': size < limit, '>': size > limit, '=': size === limit }[m[2]];
  }
  return null;
}

// Returns 'keep' (leave as is), 'always' (unwrap the rules), 'never' (drop the rules) or a new params string.
export function resolveMedia(params) {
  const parts = params.split(',').map((p) => p.trim()).filter(Boolean);
  const survivors = [];
  let changed = false;
  for (const part of parts) {
    if (/^(not|only)\s/i.test(part)) { survivors.push(part); continue; }
    const tokens = part.split(/\s+and\s+/i).map((t) => t.trim());
    const rest = [];
    let alive = true;
    for (const token of tokens) {
      const result = token.startsWith('(') ? evalFeature(token) : null;
      if (result === null) rest.push(token);
      else { changed = true; if (!result) alive = false; }
    }
    if (!alive) continue;
    const meaningful = rest.filter((t) => !/^(screen|all)$/i.test(t));
    if (meaningful.length === 0) return 'always';
    survivors.push(rest.join(' and '));
  }
  if (!changed) return 'keep';
  if (survivors.length === 0) return 'never';
  return survivors.join(', ');
}

export default function fixedViewport() {
  return {
    postcssPlugin: 'postcss-fixed-viewport',
    OnceExit(root) {
      root.walkAtRules('media', (atRule) => {
        const result = resolveMedia(atRule.params);
        if (result === 'keep') return;
        if (result === 'always') atRule.replaceWith(atRule.nodes ?? []);
        else if (result === 'never') atRule.remove();
        else atRule.params = result;
      });
    },
  };
}
fixedViewport.postcss = true;
