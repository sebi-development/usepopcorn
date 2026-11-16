# Watchlist command centre: structure and build plan

> Saved 2026-11-15 for a fresh session. Nothing is built yet. Start with section 7 (engineering
> pass), then build Phase 1. Suggested repo copy: `docs/watchlist-command-centre.md`.

Status (2026-11-15): product and design agreed; **engineering pass not done yet**. Next session
starts with the engineering pass for Phase 1 (section 7), then builds Phase 1.

Design canvas (private): https://claude.ai/artifact/RnwrMSzPdHDBYWguc1gvCU
- Artboard **D** (`Combined.dc.html`) + **D · Phone** (`Phone.dc.html`) = the chosen base.
- Artboard **B** (`Tonight.dc.html`) = the look of the Tonight panel.
- Artboard **A** (`Main.dc.html`) = the paged grid; **C** (`Shelves.dc.html`) = the extra rows.
Mockups use coloured poster placeholders; the real page uses MediaCard with TMDB posters.
Small visual polish happens while building.

## 1. Why

Today the watchlist is one `MediaRow` (Home + own profile, limit 15) over rows that hold only
`tmdb_id, media_type, title, poster_path`. Nothing can be filtered, and nothing helps answer
"what do I watch now?". Goal: a page that is useful daily, impressive to recruiters, and light.
Real data: 1 user, 59 items (56 movies, 3 series); design for 50–300.

## 2. Product decisions

- Its own lazy route **`/watchlist`** (not an expanded MediaRow, not a profile tab).
- Home's watchlist row "View all" and `WatchlistCard` (count > 0) lead to `/watchlist`; add a
  Watchlist link to the navbar.
- **One filter state, in the URL**: the Tonight panel is the large front for Type, Length and Mood;
  the FilterBar shows the same filters plus Genre, Release and Sort. The 3-card draw and the
  All saved grid read the same filtered list. Removing a value chip clears the panel too.
- **Length**: movies by runtime (Under 90 min · 90–120 min · 2 h+); series by **number of seasons**
  (1 season = quick binge · 2–3 seasons · 4+ seasons = long run). With Type = All the length row
  shows a hint ("Pick Movies for running time, or Series for number of seasons").
- Tonight panel **opens on All**. **First state**: lead card = today's pick (`get_watchlist_pick`,
  `useWatchlistPick`) + two random titles; Draw again shuffles from the filtered list.
- **No match / fewer than 3**: show what fits, plus a one-tap widen ("Any length", then
  "Surprise me"); 0 matches = dashed empty note in place of the cards.
- **Moods** (presets over genres, client-side; tune while building):
  - Adrenaline: movie 28 Action, 53 Thriller, 80 Crime, 27 Horror · tv 10759, 80
  - Feel-good: movie 35 Comedy, 16 Animation, 10751 Family, 10402 Music · tv 35, 16, 10751
  - Brain food: movie 878 Sci-Fi, 9648 Mystery, 99 Documentary, 36 History · tv 10765, 9648, 99
  - Chill & cozy: movie 10749 Romance, 18 Drama · tv 18
  - Surprise me = no mood filter
- **Up next**: pin up to 3 titles, shown as a shelf near the top and as a pin marker on cards.
  What happens on a 4th pin is still open (section 7).
- **Card face** (MediaCard): length chip bottom-left ("1h 56m" / "2 seasons"), pin marker
  top-left on pinned titles, "Added 3 months ago" line in the info overlay. No TMDB score chip
  on the face (the score stays in the overlay).
- Watchlists **and favourites** become public, like ratings (Phase 3, RLS change).
- Stored metadata per row: genres, release date, runtime (movies), seasons (series). No
  director/cast.

## 3. Page structure (top to bottom)

| # | Section | Look taken from | Reuses |
|---|---|---|---|
| 1 | **What's on tonight?** panel | **B** (preferred over D's version): tint chip "From your N saved titles", big heading, SlidingTabs for length, two-line mood cards (label + genre hint), Draw button with match count, 3 drawn cards (lead larger, ringed), "Watch …" + "Pin to Up next" buttons. **Plus D's Type switch** (All · Movie night · Binge a series) and the minutes ↔ seasons swap | `SlidingTabs`, `Chip`, `Button`, `MediaCard` |
| 2 | **Up next** shelf (3 pinned) | B/D | `MediaRow` |
| 3 | **Shelves** (Home-style rows, more later) | **C** | `MediaRow` + View all |
|   | · Your friends rated these (friends' avg + count chip) | C | `StatChip` |
|   | · Under 90 minutes | C | |
|   | · On your list for over a year | C | |
|   | · Not out yet (Upcoming chip) | C | |
| 4 | **All saved**: FilterBar + value chips + "N of 59", grid, **numbered pages** | **A** | `FilterBar`, `MediaRow` grid mode + `PaginationControls` (as in Filmography) |

Phone (`Phone.dc.html`): compact panel: All · Movies · Series segmented row, one scrollable chip
row (length chips for the chosen type + moods, tap again to clear), Today's pick as a small
horizontal card, full-width "Draw 3" (3 small cards appear only after a draw); then the Up next
scroller (w-32 cards), shelves, pills row and the 2-column grid. Touch targets ≥ 44px.

No preset FeatureCards on this page (dropped for weight).

## 4. Phases (each one is its own branch/PR and ships something visible)

**Phase 1: foundation + page core**
- Migration: `genre_ids smallint[]`, `release_date date`, `runtime smallint` (movies),
  `seasons smallint` (series) on `user_media_interactions`; backfill existing rows.
- Enrich on add: list items already carry `genre_ids` / `release_date`; runtime / seasons come
  from the cached details, else one details fetch inside the add mutation.
- Fix `toggleInteraction`: it deletes by `tmdb_id` only (movie and TV ids overlap): add
  `media_type`.
- `/watchlist` route (tier, nav link, Home links), one fetch of the full list with the new
  columns + `created_at`, client-side filtering (Filmography pattern), URL filters.
- All saved: FilterBar (Type, Length, Mood, Genre, Release, Sort: Recently added / Oldest added /
  Release / Length) + paged grid.
- MediaCard: length chip + "Added …" in the overlay (small props, no new card component).
- Shelves derived client-side from the same list: Under 90 minutes, On your list for over a
  year, Not out yet. Your friends rated these needs one RPC (own watchlist ∩ followed users'
  ratings: avg + count). `ratings` and `follows` are already readable, so no RLS change. If it
  makes the PR too big, move it to Phase 3.

**Phase 2: Tonight**
- The B-style panel (desktop) and the compact panel (phone), draw from the filtered list, first
  state = today's pick, no-match hint, click-only draw animation.
- Up next: pin storage, shelf, pin marker, "Pin to Up next", 3-pin limit.

**Phase 3: social**
- RLS: watchlist + favourites rows readable by `authenticated` (like `ratings_select_all`);
  update the ProfilePage comment and requests (other profiles may now show both).
- Watchlist on other users' profiles; Watch together (overlap with a friend's watchlist).

**Phase 4: streaming on my services**
- "My services" on the profile (the country already exists), a per-title provider cache with a
  TTL (the `mdblist_cache` pattern), and the filter. Reuse `useWatchProviders` /
  `streamingLinks.js`.

## 5. Code to reuse (verify paths when starting)

- `src/components/media/MediaRow/MediaRow.jsx`: row + grid mode (`gridItems`, `page`,
  `totalPages`, `onPageChange`, `renderItem`); grid is `grid-cols-2 … lg:grid-cols-5`.
- `src/components/media/MediaCard.jsx`: add small props for the length chip, pin marker and
  added-ago line.
- `src/components/filters/FilterBar.jsx`, `FilterPill.jsx`, `src/hooks/useUrlFilters`,
  `src/utils/filters.js`.
- `src/features/people/components/Filmography/` (`Filmography.jsx`, `useFilmographyFilters.js`):
  the client-side filter + numbered-pages precedent.
- `src/components/ui/SlidingTabs.jsx`, `Chip.jsx`, `Button.jsx`, `src/components/media/StatChip.jsx`.
- `src/features/interactions/hooks/useInteractions.js`, `useToggleInteractions.js`,
  `useMediaState.js`, `useWatchlistPick.js`; `src/services/interactions.js`.
- `src/features/profile/components/Watchlist.jsx` (Home/profile row; its "View all" →
  `/watchlist`), `src/features/browse/components/cards/WatchlistCard.jsx` (link target).
- Route tiers: `src/App.jsx`, `src/layout/prefetch.js`; keys: `src/lib/queryKeys.js`;
  cache tiers: `CACHE` in `src/lib/queryClient.js`.

## 6. Constraints (from CLAUDE.md and memory)

- Lightweight first: no new libraries, no wrapper/shell components; reuse primitives with small
  props. Check the bundle (new lazy chunk, nothing new in the guest entry chunk).
- Motion: animate only on deliberate clicks (the draw), `ease-out-quint`, one animated property,
  `motion-reduce` snap; no `filter: blur()` glows, no `backdrop-blur` on moving elements.
- No sideways page scroll on phones (only MediaRow scrollers scroll); test in WebKit.
- Query keys from `queryKeys`, cache tiers from `CACHE`; optimistic toggles keep patching
  `mediaState` and the list.
- DB: migrations only (`pnpm db:new`, `db:dry`, push only with the user's go-ahead); Claude
  writes the SQL, the user writes the JS core (learning split). Update `CLAUDE.md` schema +
  `functions-reference` after pushing.
- Short one-line comments; no Claude attribution in commits or PRs; perf report after Phase 1.

## 7. Open for the engineering pass (do first next session)

- Backfill: how to fill runtime/seasons for existing rows (a one-off script against TMDB vs a
  client-side lazy enrich, which would need an UPDATE policy).
- Pin storage: `pinned_at timestamptz` column (needs an UPDATE policy, pins ordered) vs
  `interaction_type = 'up_next'` (fits the insert/delete model). What a 4th pin does (refuse with
  a toast vs replace the oldest).
- Seasons staleness for running shows: refresh when the Detail page loads that title, or accept.
- Do the shelves follow the active filters, or stay fixed? What does a shelf's "View all" do (set
  the matching filter and scroll to All saved vs MediaRow's own in-place grid)?
- Shape and cache tier of the watchlist query (full list, `CACHE.user`), and how
  `getInteractions` grows (columns) without bloating the Home row.
- Friends-rated RPC: signature, keyset vs a plain capped list, cache tier (`aggregate`).
- Where the page's code lives (`src/features/watchlist/`) and the import boundaries it touches
  (`components/media` → `features/interactions` is the existing exception).
- Draw randomness: client-side `Math.random` over the filtered list; the lead card stays today's
  pick until the first draw.

## 8. Verification (per phase)

- `pnpm lint`, `pnpm build` (the entry-chunk guard still passes; note the new chunk size).
- `pnpm dev`: filters change the URL and the grid with no requests; paging; add/remove from
  watchlist updates the page, the Home row and the counts; movie/TV id overlap is handled.
- `pnpm audit:mobile` / `audit:checks` for overflow and tap targets; check desktop Safari.
- `pnpm db:dry` before any push; RLS `EXPLAIN` recipe for the new RPC.
