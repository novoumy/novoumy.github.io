# novoumy site cleanup summary

## What changed

- Removed 96 unused or orphaned files, including duplicate app/data/motion modules, the unused `components/ui` library, unused helper components, and an obsolete terminal stylesheet.
- Removed the unused TanStack Start routing/server scaffold, Supabase client/auth integration, deprecated Drizzle schema/migrations, and stale route-test files. The deployed site is the Vite app entered through `src/main.tsx`.
- Removed the placeholder `scripts/sync-steam.py`; kept the active Steam sync workflow and `scripts/sync-steam.mjs`.
- Removed stale asset metadata, an unreferenced image, and an `.ico` file that was byte-identical to the retained `public/favicon.ico`.
- Removed unreachable CSS for retired sliders, equalizer/badge styles, old drawers, inactive transition effects, and the never-enabled CRT overlay.
- Removed additional dead exports from active modules: the unused `GamePlatform` type, obsolete `specsSummary`/`specHighlights` data, and the unreferenced `closeOverlayAnimated()` helper.
- Removed unused `@supabase/supabase-js` and `lucide-react` dependencies, updated `package.json`, and synchronized/pruned both `package-lock.json` and `bun.lock`.
- Removed the matching Lucide prebundle exclusion from `vite.config.ts`.

## Preserved

The live React views, interactions, layout/responsive styles, data, audio, Steam library JSON and sync process, icons/images used by the site, Open Graph image, SEO files, GitHub Pages workflows, and custom `public/404.html` page were retained. The active UI code and content were not redesigned or rewritten.

## Validation

- Rebuilt the source import graph from `src/main.tsx`: 42 reachable app files and no unresolved local imports.
- Checked local public asset references: no missing referenced assets.
- Parsed all 39 TypeScript/TSX and Vite TypeScript config files: no syntax errors.
- Parsed the active CSS: no CSS syntax errors.
- Checked the Node maintenance/config scripts and the Python OG-image script for syntax errors.
- Confirmed `package.json` dependency declarations match the root dependency declarations in both lockfiles.

A full Vite production build and runtime browser test could not be completed in this environment. Dependency installation timed out because the npm registry could not be resolved (`EAI_AGAIN`), leaving the Vite executable unavailable; this is an environment/network limitation, not a confirmed application build failure.

## Follow-up startup fix

- After the cleaned archive was deployed, a blank-screen regression was identified: `src/App.tsx` still calls React's `useState` for the active route, but its import had been removed while deleting the retired CRT toggle state.
- Restored the `useState` import and kept the retired CRT toggle removed. This fixes the confirmed `useState is not defined` startup crash.
- Revalidated the corrected app source: all 38 TypeScript/TSX/config source files passed a syntax parse, the active route state hook and import are present, and the active CSS parses cleanly.
- A full Vite build/browser smoke test remains unavailable because `npm ci` cannot complete in this environment (registry access timed out); the corrected ZIP is therefore syntax-checked but not runtime-build-verified here.

## Latest Socials icon update (2026-11-24)

Applied the five updated Socials references from the latest user message:

- Facebook now uses the exact SVG path supplied by the site owner, in `currentColor`.
- Pinterest now uses the supplied P-in-a-circle artwork, traced on its original 13×14 pixel grid. Its purple foreground is retained and the pale background is transparent.
- NameMC now uses the supplied 6×6 creeper-face pixel pattern in dark purple (`#3A2272`), with no background.
- Snapchat now uses the supplied 10×10 gridded ghost artwork. The grid is excluded and the pixel mask is symmetrical.
- Steam now uses the supplied 12×12 black pixel emblem, including the square frame and internal symbol; the white image background is transparent.

The new art is rendered as inline SVG paths, so it remains crisp when resized and adds no image-fetching overhead. The obsolete earlier NameMC creeper sprite and alias were removed. The original page content, links, tile layout, spacing and interactions remain unchanged.
