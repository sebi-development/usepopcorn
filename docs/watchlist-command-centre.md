# Watchlist command centre: structure and build plan

> Saved 2026-11-15, updated 2026-11-16. **For the agent: Phases 1–3 are built and tested (sections 9–11).
> Next: the open items in section 11, then Phase 4 (streaming).**

Status (2026-11-16): **Phase 1** on `feat/watchlist-page`, **Phase 2** on `feat/watchlist-tonight`
(stacked on Phase 1), **Phase 3** on `feat/watchlist-social` (stacked on Phase 2, not committed yet). All three
phases' migrations are applied to production. No branch is pushed yet.

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

## 7. Engineering pass (resolved 2026-11-16)

Decided and built (Phase 1):
- **Backfill**: one-off against TMDB (plain `/movie/{id}`, `/tv/{id}`), no lazy client enrich (it
  would need an UPDATE policy). Done in production: 0 of 61 watchlist rows lack metadata.
- **Enrich on add**: watchlist adds only. Detail page passes `genres`, so no request; a card add
  makes one plain TMDB details request inside the mutation; a TMDB failure fails the add.
- **Seasons staleness**: accepted (3 series). Revisit if the Length filter visibly misses titles.
- **Shelves**: fixed, built from the whole list; filters narrow only All saved. A shelf's
  "View all" replaces the filters with its preset and scrolls to All saved (one grid, shareable URL).
- **Query**: one list for Home's row and the page, `queryKeys.interactions('watchlist', id)`,
  `CACHE.user`; `getInteractions` selects the new columns + `created_at`, newest first.
- **Length with Type = All**: one `length` filter (`short|medium|long`) read per title (minutes
  for movies, seasons for series); labels follow Type. The filter list never depends on another
  filter's value.
- **Code**: `src/features/watchlist/` + `src/pages/app/WatchlistPage.jsx`, route in tier 2
  (prefetched with Profile/Detail), no loader.
- **Pagination**: the page lives in the URL (`useUrlPage`), see CLAUDE.md "Pagination".

Decided for Phase 2 (2026-11-16, built, see section 10):
- **Pin storage**: `pinned_at timestamptz` on the watchlist row, a column-level `UPDATE (pinned_at)` grant
  and an own-watchlist-rows UPDATE policy. Removing the title removes the pin.
- **4th pin**: refused with a toast, checked against the cached list (no request); the
  `limit_watchlist_pins` trigger refuses it too (stale tab or second device).
- **Pin / unpin on cards**: a Pin item in the card menu (shown only while the menu is open) on
  `/watchlist` cards, plus the top-left marker on pinned titles.
- **Draw**: titles ranked by a hash of title + seed (`drawTitles`); Draw writes a random seed to the URL
  (`?draw=`), so Back shows the same three and narrowing the filters keeps the drawn titles that still
  fit. No seed = today's pick first, then two titles ranked by today's date (same all day).

Decided for Phase 3 (2026-11-16, built, see section 11):
- **Friends-rated RPC**: `get_watchlist_friends_ratings()` (no params, `auth.uid()`), one row per own watchlist
  title rated by followed users, best average first; capped by the watchlist's size, so no keyset. Key
  `friendsRatings.watchlist(id)` (under `friendsRatings.all`, so `useFollow` refreshes it), `CACHE.aggregate`.
  The shelf is the **last** shelf and its RPC waits until it is within 600px; no "View all" (capped at 15).
- **Watch together**: a row on another user's profile, their watchlist ∩ the viewer's (`mediaState`), no request.
- **Other profiles**: Favourites at load (as on one's own); their watchlist is **last**, fetched within 600px,
  "View all" pages the fetched list in place (`?grid=watchlist`).

## 8. Verification (per phase)

- `pnpm lint`, `pnpm build` (the entry-chunk guard still passes; note the new chunk size).
- `pnpm dev`: filters change the URL and the grid with no requests; paging; add/remove from
  watchlist updates the page, the Home row and the counts; movie/TV id overlap is handled.
- `pnpm audit:mobile` / `audit:checks` for overflow and tap targets; check desktop Safari.
- `pnpm db:dry` before any push; RLS `EXPLAIN` recipe for the new RPC.

## 9. Phase 1 status (2026-11-16): DONE, tested

Branch `feat/watchlist-page` (4 commits on top of `main`, **not pushed, no PR**: `git push` / `gh pr create`
were permission-denied in the session). Migrations `20261116083629_watchlist_metadata.sql` and
`20261116102041_title_state_typed_keys.sql` are **already applied to production**.

Built:
- DB: `genre_ids`, `release_date`, `runtime`, `seasons` on `user_media_interactions`; unique key now
  `(user_id, interaction_type, media_type, tmdb_id)` (the old key made a series sharing a saved movie's id
  unsavable). Typed state: `get_my_title_state()` keys `'<type>:<id>'`, ratings get `(user_id, type, tmdb_id)`.
- Client: `addInteraction` (upsert with metadata) / `removeInteraction` (with `media_type`) replace
  `toggleInteraction`; `useToggleInteractions` is explicit add/remove with no refetch after an exact
  optimistic write; `titleKey` in `utils/tmdbItem.js`; `getMediaSummary` in `services/tmdb.js`.
- Page: `/watchlist` (lazy chunk 2.44 kB gzip, tier 2), shelves Under 90 minutes · Waiting longest ·
  Not out yet, All saved with FilterBar (Type, Length, Mood, Genre, Release, Sort) and numbered pages in the URL.
- Links: user menu item, Home/profile row `viewAllTo`, `WatchlistCard` fallback link.
- Shared: MediaCard `badge`/`addedAt`, MediaRow `badgeOf`/`showAdded`/`viewAllTo`, `timeSince`,
  `useUrlFilters.setFilters`, `useUrlGrid`/`useUrlPage` + `ScrollRestoration` (grid fix, `e57c34f`).

Changed from the plan above:
- "On your list for over a year" became **Waiting longest** (15 oldest saves; shown only with > 15 saves;
  the oldest save is from Aug 2026). **Your friends rated these moved to Phase 3.**
- Tonight panel, Up next, pins: not started (Phase 2).

Verified: `pnpm lint`, `pnpm build` (entry guard passes), headless Brave runs against the stubbed
Supabase (filters, labels, sorts, badges, Added line, shelves + View all, user-menu/Home links, remove sends
`media_type`, no refetch after a toggle, a card add makes one plain TMDB details request), `audit:checks`
all PASS, `audit:mobile` no overflow on `/watchlist` (new undersized targets: none).

Not done / for the next session:
1. Push the branch, open the PR, merge (the user approved; `git push` was blocked by the permission
   system, so the user runs it). See section 10 for Phase 2's branch.
2. The "contract" half of the typed-keys migration: drop the old `ratings (user_id, tmdb_id)` key and
   `get_my_media_state`, make `p_type` required, **after** the new client is deployed. Both still exist.
3. ~~Update the snapshots in `supabase/functions-reference/` and the CLAUDE.md tables~~ (done 2026-11-16).
4. Perf report for Phase 1 (`perf-report` skill): new lazy route, a bigger list payload, tier-2 prefetch.
5. Check `/watchlist` in desktop Safari / WebKit (overflow, filter pill animation); only Chromium was run.
6. Phase 2: see section 4 and the open items in section 7. The only untested path is a real id collision
   (a movie and a series with one id saved together), which the stub (ids only) can't model: try it once
   against production with a throwaway title.

## 10. Phase 2 status (2026-11-16): DONE, tested

Branch `feat/watchlist-tonight`, stacked on `feat/watchlist-page`. Migration
`20261116162523_watchlist_pins.sql` is **applied to production** (the client selects `pinned_at`, so it
had to go first).

Built:
- DB: `pinned_at` + column-level `UPDATE (pinned_at)` grant (Supabase's table-wide UPDATE revoked from
  `anon` / `authenticated`), policy `Users can pin own watchlist titles`, trigger `limit_watchlist_pins`.
- Client: `setWatchlistPin` (service), `useWatchlistPin` + `PIN_LIMIT` (features/interactions: optimistic
  patch of the list, no refetch, a 4th pin refused locally), `drawTitles` / `toUpNext` (watchlistItems).
- Tonight panel (`features/watchlist/components/TonightPanel/`): Type tabs, Length tabs (desktop) or chips
  (phone), mood cards with hints, Draw with the match count and a one-tap widen (Any length, then Surprise
  me), three cards (lead ringed, in the middle on desktop) with captions, Watch + Pin buttons (desktop).
  Phone: the lead as one wide card until the first draw, then three small cards. Dashed notes for loading
  errors, an empty list and no matches. Draw fades the new cards in (opacity, 70 ms stagger, click only).
- Up next shelf (`N / 3`), Pin item + marker on all `/watchlist` cards (`MediaRow showPin`,
  `MediaCard showPin / isPinned / className`). The drawn cards' menu only pins.
- The old page header and `summarize` are gone (the panel is the header); All saved renders once the
  list has titles. A single-type list labels Length for its type (`onlyType`).

Verified: `pnpm lint`, `pnpm build`, `audit:checks` all PASS, `audit:mobile` no overflow on `/watchlist`
(no new undersized targets), headless Brave runs against the stub at 375 / 768 / 1024 / 1440 (filters
write the URL with no request, draw seed survives a reload, one PATCH per pin and no refetch, the 4th pin
is refused without a request, unpin, removing a pinned title drops its pin). Against production, in a
transaction that rolled back: own pins OK, the 4th refused, other columns `42501`, favourites and
other users' rows 0 rows, adds still work.

Not done / next:
1. Push both branches and open the PRs (Phase 1 first; Phase 2's PR targets `feat/watchlist-page` until
   that merges).
2. Section 9 items 2 (contract migration after deploy), 4 (perf report: see the session's report) and 5
   (desktop Safari / WebKit: no Playwright runner here, check by hand).
3. A real pin round trip in the deployed app (the stub can't show PostgREST's error shape for the
   trigger; the message is matched by text in `useWatchlistPin`).

## 11. Phase 3 status (2026-11-16): DONE, tested

Branch `feat/watchlist-social`, stacked on `feat/watchlist-tonight`, **uncommitted**. Migration
`20261116204227_watchlist_social.sql` is **applied to production**; `functions-reference/get_watchlist_friends_ratings.sql`
is its snapshot.

Built:
- DB: policy `Signed-in users can read all interactions` (replaces `Users can read own interactions`);
  `get_watchlist_friends_ratings()` (security invoker, `search_path = ''`, default grants).
- /watchlist: `FriendsRatedShelf` (last shelf; friends' average as the card's star, "N friends" badge, no Pin
  since the star takes the pin's corner), `useWatchlistFriendsRatings`, `toFriendsRated` / `friendsLabel`.
- Profiles: favourites load for every profile; `UserWatchlist` (last on someone else's profile) = Watch
  together row + their Watchlist row with an in-place paged grid. Own profile unchanged.
- Audit stub: the friend's lists are readable (22-title watchlist, 2 favourites) and the new RPC is stubbed.

Changed from the plan above: Favourites stays above Recently rated on other profiles (today's order); only the
watchlist moved to the bottom.

Verified: `pnpm lint`, `pnpm build` (entry guard passes; ProfilePage 3.12 → 3.47 kB gzip, WatchlistPage
5.30 → 5.65 kB, entry +0.01 kB), `audit:checks` all PASS, `audit:mobile` no overflow anywhere (incl.
`profile-friend`, `watchlist`). Headless Brave at 375 / 1440 against the stub: the shelf joins the RPC to the list
(a title no longer saved drops out), shows 8.3 / "4 friends"; its RPC waits until the shelf is near (0 calls
at load on a tall page, 1 on approach); a friend's profile loads favourites at load and their watchlist on
approach; Watch together = the overlap and drops a title as soon as it is removed from one's own list (one
DELETE); "View all" pages 20 + 2 with `?grid=watchlist&page=2`; one's own profile shows no Watch together. In
production, rolled back: the RPC's query as the watchlist owner returned 8.3 (4 friends) and 7.7 (3) for two
temporary rows, 0 rows kept. After the push (live, rolled back): another user reads the owner's 67 watchlist rows and all
11 favourites but updates / deletes 0; anon reads 0 rows and 0 RPC rows; the RPC itself returns the same two rows;
`EXPLAIN` 0.49 ms (index-only scan on the interactions key, then `ratings_tmdb_id_idx` per title).

Not done / next:
1. Commit, then push the three branches / PRs in order (Phase 1 → 2 → 3). The policy is already live, so other
   users' lists are readable through the API before this client ships.
2. Real data is thin: the people the user follows rated 0 of their watchlist titles, and only one user has a
   watchlist, so both new rows stay hidden in production until that changes.
3. Still open from earlier: the typed-keys contract migration, the perf report, desktop Safari / WebKit.
