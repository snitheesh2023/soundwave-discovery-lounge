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

- Spotify uses Authorization Code + PKCE entirely in the browser (`src/lib/spotify.ts`); only the public Client ID is configured, never a client secret.
- YouTube Data API calls run in server functions (`src/lib/youtube.functions.ts`) so the API key stays server-side; playback only through the official IFrame player.
- Playback goes through engine adapters in `src/player/engines/*` behind one player context; pure queue rules live in `src/player/queue-logic.ts` and are unit-tested.
- Made-up content must carry the "Sample" source badge so it is never mistaken for real provider data.
- tsconfig is strict (exactOptionalPropertyTypes, noPropertyAccessFromIndexSignature): declare optional props as `T | undefined` and use bracket access for env vars and index signatures, or the preview build fails.
