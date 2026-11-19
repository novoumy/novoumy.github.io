<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- The whole site renders client-only inside `src/routes/index.tsx` (`ClientOnly` + lazy `SiteRoot`); tabs and folders are switched by the URL hash (`#games`, `#music`, ...) so existing shared links keep working and all tabs stay mounted for instant switching.
- Site content (profile, socials, media, music, quotes, manual games) lives in `src/siteData.ts`; edit content there, not in views.
- Steam data is synced by the GitHub Action in the user's novoumy/novoumy.github.io repo; the site fetches that repo's public/data/steam-games.json at runtime (raw GitHub, then GitHub Pages fallback). Never move the Steam API sync into this project.
- Styling is ported from the original Tailwind v3 theme into `src/styles.css`; keep the retro palette tokens (lavender, wine, rose, cool-white, per-library accents) as the source of truth.
- Every Interests folder (media, music, games, quotes) renders inside the shared `RetroOverlay` window (`.retro-theme` tokens in `src/styles.css`), so all folders keep the main window's look; style folders through those tokens, not hardcoded colors.
