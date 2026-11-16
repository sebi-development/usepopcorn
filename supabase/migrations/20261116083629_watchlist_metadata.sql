-- Watchlist metadata for the /watchlist page's client-side filters (Length, Genre, Release, Sort).
-- Filled on add by the client (TMDB details) and once for existing rows by a backfill migration.
-- All nullable: favourites don't store them, and TMDB may not know a runtime yet.
alter table public.user_media_interactions
  add column if not exists genre_ids smallint[],
  add column if not exists release_date date,
  -- Movies only (minutes)
  add column if not exists runtime smallint check (runtime > 0),
  -- Series only
  add column if not exists seasons smallint check (seasons > 0);

-- TMDB movie and TV ids overlap, so a title is identified by its type too. The old key let a series
-- whose id matches a saved movie fail to insert. The new key is looser, so every existing row fits it.
create unique index if not exists user_media_interactions_user_type_media_tmdb_key
  on public.user_media_interactions (user_id, interaction_type, media_type, tmdb_id);

alter table public.user_media_interactions
  drop constraint if exists user_media_interactions_user_id_tmdb_id_interaction_type_key;

-- The new key starts with (user_id, interaction_type), so it serves the list reads this index did
drop index if exists public.user_media_interactions_user_id_interaction_type_idx;
