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
| Socials | Owner-supplied custom pixel SVG |
| Interests | Save |
| Specs | CPU |

### Interests folders

| Folder | Icon |
| --- | --- |
| Media | Original two-tone pixel sprite (restored) |
| Games | Original two-tone pixel sprite (restored) |
| Music | Original two-tone pixel sprite (restored) |
| Quotes | Original two-tone pixel sprite (restored) |

### Socials

| Social | Icon source |
| --- | --- |
| Discord | Pixelarticons Discord |
| Steam | Original custom pixel fallback |
| Roblox | Owner-supplied Roblox square SVG |
| GitHub | Pixelarticons GitHub |
| Instagram | Pixelarticons Instagram |
| X | Pixelarticons X |
| YouTube | Pixelarticons YouTube |
| NameMC | Purple creeper-face silhouette with transparent cut-outs |
| Pinterest | Original custom pixel fallback |
| Facebook | Free Facebook mark inside an original pixel circle |
| Snapchat | Symmetric custom ghost pixel fallback |
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

The cooler, RAM, SSD and PSU symbols are adapted from the site's pre-existing custom pixel sprites and normalized to the same 24×24 drawing grid. Most custom fallback artwork uses the same `currentColor` treatment as the library icons; the NameMC creeper intentionally uses a fixed purple fill, with no backing shape.

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


## Follow-up icon adjustments

- Restored the exact original two-tone 16×16 Media, Games, Music and Quotes sprites from the first site archive. Their original wine body fill, folder accent fill, crisp pixel rendering and 80px/96px sizing are preserved in the Interests folder grid.
- Replaced the Roblox social mark with the exact SVG path supplied by the site owner.
- Replaced the Socials navigation glyph with the exact SVG path supplied by the site owner.
- Changed NameMC to a purple (`#8B5CF6`) creeper-face silhouette. The background remains transparent and the facial cut-outs remain unfilled.
- Kept the symmetric 16×16 Snapchat sprite on its native SVG viewBox. This avoids the uneven column duplication that a 16-to-24px nearest-neighbour conversion can introduce.

## Latest Socials reference-image update (2026-11-24)

The latest four user-uploaded images were used as direct artwork references for the Socials tiles. Their visible guide grids and solid white canvases were treated as backgrounds, not as part of the icons, so the resulting SVGs render with transparent backgrounds:

- **Facebook:** replaced the prior Facebook-in-circle treatment with the exact 24×24 SVG path supplied in the message (`currentColor`).
- **Pinterest:** replaced the previous fallback with a 13×14 pixel-grid trace of the supplied P-in-circle image, retaining its dark purple foreground (`#3A2272`) and removing the lavender backing.
- **NameMC:** replaced the previous creeper drawing with the exact 6×6 pixel pattern from the supplied reference, using the same dark purple (`#3A2272`) and transparent negative space.
- **Snapchat:** replaced the earlier hand-drawn fallback with a 10×10 pixel trace of the supplied gridded ghost reference. The mask is symmetric and the grid/background is omitted.
- **Steam:** replaced the previous improvised mark with a 12×12 pixel trace of the supplied black-and-white Steam emblem, retaining the square frame and inner symbol while removing the white page background.

All five replacements are rendered as inline SVG paths with crisp pixel edges. No extra image request or third-party icon dependency is introduced. The unused old `minecraft-filled` sprite and its alias were removed after NameMC switched to the supplied 6×6 source.
