# Performance pass

Goal: same look, much lighter to run.

## Biggest wins
1. **Backdrop no longer re-blurs the glass every frame.** The Main window and folder windows use `backdrop-filter`.
   Stars/particles animating behind them forced a re-blur of the whole window on every frame.
   - Stars/particles that would sit behind the Main window aren't drawn (`PixelBackdrop.tsx`); the sky around it is unchanged.
   - While a folder is open the backdrop animation is paused (`html[data-folder-view='open']`).
   - Nebulas are static (the 60px blur is rasterised once instead of animating).
2. **Removed the per-card `backdrop-filter: blur(8px)`** on `.r-box`, `.r-tag`, `.pixel-tile` (hundreds of stacked blurs in Media/Music/Games).
3. **Avatar halo** now fades the opacity of a pre-painted glow (compositor only) instead of animating a 70px box-shadow every frame.
4. Glass shimmer layer is half the area; text-shadow's invisible 32px layer removed.
5. **Smaller first load:** `siteData.ts` split, media/music/quotes/games data now live in `src/data/` and load with their folder.
   Avatar + Howl's poster converted to WebP (247 KB -> 35 KB, 587 KB -> 83 KB). React in its own cached chunk.
   Google Fonts no longer block first paint.
6. **Fewer re-renders:** Main/Socials/Specs are memoized; window resize is coalesced to one update per frame.
7. Tab-switch animation no longer animates `filter: blur()` on the whole panel; bubble canvas idles in background tabs.

## Load only what's needed (second pass)
- Only the Main tab is in the first load. Socials, Interests and Specs are separate chunks, fetched and mounted the first time their tab opens (then kept).
- The four folders (Media/Games/Music/Quotes) are no longer preloaded at idle. A folder's code is fetched when its icon is hovered/focused or opened; the Steam JSON loads only when Games opens.
- Background music file is not requested until the first interaction (`preload = 'none'`).
