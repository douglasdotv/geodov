# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Three top-level parts, each a separate runtime:

- `web/` — Next.js 15 app (App Router, React 19, TypeScript, Tailwind). This is the main application and where almost all work happens. Deployed at https://geodov.com.
- `userscript/geodov.user.js` — A Tampermonkey/Violentmonkey userscript that runs on `https://www.geoguessr.com/*`, intercepts GeoGuessr's own API responses (`/api/duels`, `/api/battle-royale`, `/api/v3/games`), reverse-geocodes via Nominatim, and inserts rows directly into Supabase. It is the *only* writer of guess data. `SUPABASE_URL`, `SUPABASE_KEY`, and `GEOGUESSR_PLAYER_ID` are placeholder strings that must be replaced with real values before the script works.
- `db/` — Supabase/Postgres schema and RPC function definitions. `schema.sql` is the `guesses` table (single table, wide columns); `functions.sql` contains all the SQL functions the web app calls via `supabase.rpc(...)`.

These pieces communicate only through the Supabase `guesses` table. There is no server between the userscript and the DB, and no shared build — `web/` is its own npm project.

## Commands (run from `web/`)

```
npm run dev          # Next dev server with Turbopack
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # next lint (ESLint + eslint-config-next + prettier)
npm run format       # Prettier write over src/**/*.{ts,tsx}
npm run format:check # Prettier check (use before commits)
```

There is no test suite in this repo.

## Architecture notes that aren't obvious from a single file

### Data flow, end to end

1. The userscript hooks `fetch`/`XMLHttpRequest` on geoguessr.com, extracts guess + actual coordinates per round, looks up place names via Nominatim, and POSTs to Supabase.
2. The `guesses` table stores *every* individual guess. Battle Royale rounds produce many rows per `(game_id, round_number)` — one per player/attempt. Duels and Challenge modes produce one row per `(game_id, round_number)` (enforced by `idx_unique_challenge_duels_guess`).
3. The web app reads via Supabase RPCs — almost never via plain `from('guesses').select(...)`. The RPCs in `db/functions.sql` do the heavy lifting: BR de-duplication (keep only the min-distance guess per round), country/movement/game-type filtering, sorting, pagination, and stats aggregation. When changing list/stats behavior, the change usually belongs in SQL, not in TypeScript.

### Web app structure

- `src/app/` — App Router. `page.tsx` is the paginated guesses table (server component; reads `searchParams`, calls `get_sorted_guesses_paginated` + `get_total_rounds_count`). `places/` is the visited-places map. `guess/[id]/` is a single-guess detail page. `admin/` + `login/` are gated by `middleware.ts`.
- `src/app/actions.ts` — Server actions wrapping Supabase RPCs for stats (`getOverviewStats`, `getCountryStats`, `getGameTypeStats`, `getMovementStats`), location queries (`getLocationsInBounds` for the map's viewport-based loading), and admin mutations (`deleteGuess`, which checks `session.isLoggedIn`).
- `src/middleware.ts` — Runs on `/admin/:path*` and `/login`. Verifies the iron-session cookie by sealing/unsealing with `SESSION_SECRET`. Unauthed `/admin` → redirect to `/login`; authed `/login` → redirect to `/admin`.
- `src/lib/session.ts` — iron-session setup. Server-side session helper is `getSession()` (uses `next/headers` `cookies()`). Middleware cannot use that helper (no `cookies()` in middleware) and instead calls `unsealData` directly — keep those two code paths in sync if you change the session shape.
- `src/lib/supabaseClient.ts` — Single anon-key Supabase client. Both server components and server actions use it. Environment variables `SUPABASE_URL` and `SUPABASE_KEY` are required at import time (throws otherwise).
- `src/providers/ThemeProvider.tsx` — Light/dark theme via a `.dark` class on `<html>`; CSS variables in `globals.css` drive all themed colors.
- `src/lib/utils.ts` — Shared formatters (`formatDistance`, `formatRelativeTime`, `formatMovementRestrictions`, `getGuessQuality`) and `getCountryCode` via `country-code-lookup`. Prefer reusing these over inlining new formatting logic.
- `src/lib/validation.ts` — Narrow type guards for URL search params and RPC payloads. Always run search params through these guards before passing to RPCs.

### Auth model

There is no per-user auth. The Supabase key is a public anon key (the userscript ships with it). `/admin` is a single-user gate guarded by an env-configured username + bcrypt-hashed password (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH_BASE64`) and an iron-session cookie. The only admin action is deleting a guess.

### Movement/game-type filters

Movement restriction is derived from the `movement_restrictions` JSONB column (`forbidMoving` / `forbidZooming` / `forbidRotating`) into three buckets: `moving`, `no_move`, `nmpz`. Game type is one of `GAME_TYPES` in `src/types/gametype.ts`. These strings must match the values the SQL `CASE` expressions in `db/functions.sql` check — if you add a new filter option, update both sides.

### Styling

Tailwind + a small set of custom CSS-variable-based classes in `globals.css`: `.glass` / `.glass-subtle` for the glassmorphism surface, and variables `--glass-bg`, `--divider`, `--surface-hover`, etc. for themed surfaces. Dark mode is toggled by adding `.dark` to `<html>`.

## Required environment variables (`web/.env.local`)

- `SUPABASE_URL`, `SUPABASE_KEY` — Supabase project URL and anon key
- `SESSION_SECRET` — iron-session password (≥32 chars)
- `ADMIN_USERNAME` — plain string compared against the login form
- `ADMIN_PASSWORD_HASH_BASE64` — bcrypt hash of the admin password, then base64-encoded (the server base64-decodes it before `bcrypt.compare`)
