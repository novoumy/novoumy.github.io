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
