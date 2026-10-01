-- The app's media types are 'movie' | 'tv' everywhere (TMDB paths, ratings.type and its check), but
-- this check only accepted 'movie' | 'series'. Adding a series to the watchlist or favorites sends
-- media_type = 'tv', so every such insert was rejected. No row uses 'series' (all 19 are 'movie').
alter table public.user_media_interactions
  drop constraint if exists user_media_interactions_media_type_check;

alter table public.user_media_interactions
  add constraint user_media_interactions_media_type_check
  check (media_type in ('movie', 'tv'));
