// The site renders as one of TWO fixed-size "stages" that is scaled to fit the screen (see src/lib/useStageScale.ts):
//
//   landscape  4:3  (800x600 window)  - wide screens
//   portrait   3:4  (420x560 window)  - narrow screens / phones
//
// The layout must NEVER react to the real window size, only to which stage is active. So this PostCSS plugin
// evaluates every width/height media query at build time against each stage's fixed "virtual viewport":
//
//   - true for both stages  -> the media wrapper is removed (rules always apply)
//   - false for both stages -> the rules are dropped
//   - true for one stage    -> the rules are kept but scoped to `html[data-stage='landscape' | 'portrait']`
//
// useStageScale sets data-stage on <html>. Non-size queries (hover, pointer, prefers-reduced-motion, ...) are left alone.
const STAGES = {
  landscape: { width: 2560, height: 1440 },
  portrait: { width: 420, height: 844 },
};

const toPx = (value, unit) => (unit === 'px' ? value : value * 16); // em / rem

// Evaluate one size feature. Returns true / false, or null if it is not a size feature.
function evalFeature(feature, viewport) {
  const inner = feature.trim().replace(/^\(|\)$/g, '').trim();
  let m = inner.match(/^(min|max)-(width|height)\s*:\s*([\d.]+)(px|em|rem)$/i);
  if (m) {
    const size = m[2].toLowerCase() === 'width' ? viewport.width : viewport.height;
    const limit = toPx(parseFloat(m[3]), m[4].toLowerCase());
    return m[1].toLowerCase() === 'min' ? size >= limit : size <= limit;
  }
  m = inner.match(/^(width|height)\s*(<=|>=|<|>|=)\s*([\d.]+)(px|em|rem)$/i);
  if (m) {
    const size = m[1].toLowerCase() === 'width' ? viewport.width : viewport.height;
    const limit = toPx(parseFloat(m[3]), m[4].toLowerCase());
    return { '<=': size <= limit, '>=': size >= limit, '<': size < limit, '>': size > limit, '=': size === limit }[m[2]];
  }
  return null;
}

// Returns 'keep' (no size features), 'always' (unwrap the rules), 'never' (drop the rules) or a new params string.
export function resolveMedia(params, viewport = STAGES.landscape) {
  const parts = params.split(',').map((p) => p.trim()).filter(Boolean);
  const survivors = [];
  let changed = false;
  for (const part of parts) {
    if (/^(not|only)\s/i.test(part)) { survivors.push(part); continue; }
    const tokens = part.split(/\s+and\s+/i).map((t) => t.trim());
    const rest = [];
    let alive = true;
    for (const token of tokens) {
      const result = token.startsWith('(') ? evalFeature(token, viewport) : null;
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

// `.a, .b > c`  ->  `html[data-stage='x'] .a, html[data-stage='x'] .b > c`
// Selectors that start at the root (html / :root) get the attribute merged onto that element instead.
function scopeSelector(selector, stage) {
  const attr = `[data-stage='${stage}']`;
  return selector
    .split(',')
    .map((raw) => {
      const sel = raw.trim();
      if (!sel) return sel;
      if (/^(html|:root)(?![\w-])/.test(sel)) return sel.replace(/^(html|:root)/, `$1${attr}`);
      return `html${attr} ${sel}`;
    })
    .join(', ');
}

function scopeRules(container, stage) {
  container.walkRules((rule) => {
    // Keyframe steps (from / to / 50%) are not selectors.
    if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
    if (rule.__stageScoped) return;
    rule.selector = scopeSelector(rule.selector, stage);
    rule.__stageScoped = true;
  });
}

const sameResult = (a, b) => a === b;

export default function fixedViewport() {
  return {
    postcssPlugin: 'postcss-fixed-viewport',
    OnceExit(root) {
      // Collect first: we insert/replace nodes while processing.
      const atRules = [];
      root.walkAtRules('media', (atRule) => atRules.push(atRule));

      for (const atRule of atRules) {
        if (!atRule.parent) continue; // already removed with an ancestor
        const results = {};
        for (const [stage, viewport] of Object.entries(STAGES)) results[stage] = resolveMedia(atRule.params, viewport);
        if (results.landscape === 'keep') continue;

        // Identical outcome on both stages: no scoping needed.
        if (sameResult(results.landscape, results.portrait)) {
          const result = results.landscape;
          if (result === 'never') atRule.remove();
          else if (result === 'always') atRule.replaceWith(atRule.nodes ?? []);
          else atRule.params = result;
          continue;
        }

        // Different outcome: emit one scoped copy per stage in which the rules can apply.
        const copies = [];
        for (const stage of Object.keys(STAGES)) {
          const result = results[stage];
          if (result === 'never') continue;
          const copy = atRule.clone();
          scopeRules(copy, stage);
          if (result === 'always') copies.push(...(copy.nodes ?? []));
          else { copy.params = result; copies.push(copy); }
        }
        if (copies.length === 0) atRule.remove();
        else atRule.replaceWith(copies);
      }
    },
  };
}
fixedViewport.postcss = true;
