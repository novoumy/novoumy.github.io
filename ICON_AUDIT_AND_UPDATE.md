# Novoumy — icon system update

## Inventory reviewed

The site was audited across its eagerly loaded and lazy-loaded views, not only the visible top navigation:

- 4 top-level tab icons
- 4 Interests folder icons
- 13 Socials/email entries
- 19 PC and peripheral specification cards
- Compact controls in the music overlay, navigation affordances, copy/search controls, and the existing decorative pixel illustrations

## Centralized icon mapping

### Top navigation

| Tab | Icon |
| --- | --- |
| Main | User |
| Socials | Comment Text |
| Interests | Save |
| Specs | CPU |

### Interests folders

| Folder | Icon |
| --- | --- |
| Media | Image |
| Games | Gamepad |
| Music | Music |
| Quotes | Quote Text Inline |

### Socials

| Social | Icon source |
| --- | --- |
| Discord | Pixelarticons Discord |
| Steam | Original custom pixel fallback |
| Roblox | Original Atom-style pixel fallback |
| GitHub | Pixelarticons GitHub |
| Instagram | Pixelarticons Instagram |
| X | Pixelarticons X |
| YouTube | Pixelarticons YouTube |
| NameMC | Original filled creeper-face pixel fallback |
| Pinterest | Original custom pixel fallback |
| Facebook | Free Facebook mark inside an original pixel circle |
| Snapchat | Original custom ghost pixel fallback |
| LinkedIn | Pixelarticons' free standard LinkedIn mark |
| Email | Pixelarticons Mail |

### PC specifications and peripherals

| Card(s) | Icon |
| --- | --- |
| CPU | CPU |
| Cooler | Original pixel fan |
| GPU | GPU |
| Motherboard | Circuit Board |
| RAM | Original pixel memory module |
| SSD 1 and SSD 2 | Original pixel SSD |
| PSU | Original pixel power-supply / lightning symbol |
| PC Case | PC Case |
| Monitor 1 and Monitor 2 | TV |
| Keyboard | Keyboard |
| Mouse | Mouse |
| Microphone | Mic |
| Smartphone | Smartphone |
| Tablet | Tablet |
| Earbuds | Headphone |
| Controller 1 and Controller 2 | Gamepad |

The CPU icon is also used in the Specs tab itself. Both controller cards share the same Gamepad icon, and both monitor cards share the same TV icon, as requested.

## Free-set and license choices

The project uses `pixelarticons@2.4.2`, the public npm package. Pixelarticons documents 1,036 MIT-licensed free icons and a separate Pro set. Its documentation also states that Pro SVGs cannot be redistributed as a public icon set. To keep this site's repository safe to publish, the exact Steam, Atom, Minecraft Filled, Snapchat, Facebook Circle, Game Controller and LinkedIn 2 variants are not copied into the project. The implementation instead uses original pixel fallbacks where needed, plus free alternatives where they are visually appropriate:

- Game Controller → free Gamepad
- LinkedIn 2 → free standard LinkedIn
- Facebook Circle → free Facebook mark plus an original pixel circle
- Steam, Atom/Roblox, Minecraft Filled/NameMC, Snapchat and Pinterest → original pixel-grid fallbacks

The cooler, RAM, SSD and PSU symbols are adapted from the site's pre-existing custom pixel sprites and normalized to the same 24×24 drawing grid. All custom fallback artwork uses the same `currentColor` treatment as the library icons.

## Small controls and illustrations retained

The small 12–16px toolbar controls (arrows, check, copy, close, search, chevron, sliders and document) remain custom pixel glyphs because the 24px base library is intended to scale most crisply in 24px increments. They now render as a single merged SVG path each rather than many individual rectangle elements. The tiny music-toolbar headphone and YouTube marks also retain compact pixel sprites at their original 13px size.

The campfire, PC tower, quote/dice and speaker graphics are purpose-made illustrations, not general-purpose interface icons, so they remain bespoke. Posters, game covers, profile images, music artwork and achievements are content images, not UI icons.

## Code and performance cleanup

- Added one icon registry in `src/components/PixelIcon.tsx`; tab and specification wrappers delegate to it.
- Library icons use their native 24×24 SVG components and `currentColor`.
- Custom fallback grids normalize to 24×24 and are cached as a single SVG path per icon.
- Compact toolbar sprites now use one SVG path instead of many `<rect>` nodes.
- Removed the unused Scale2x upscaler and unused sprite-centering helper, and renamed the remaining path utilities to `src/lib/pixelPaths.ts`.
- Kept the original page structure, tab order, copy/email behavior, external links, responsive containers and content data unchanged.

## Validation

The handoff includes source syntax checks, local-import checks, lockfile/JSON checks, and ZIP integrity verification. A full dependency-backed Vite build and browser regression test could not be run in this environment if the npm registry remains unreachable; the GitHub Pages workflow can still perform the normal dependency install/build during deployment.
