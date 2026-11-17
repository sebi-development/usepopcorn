-- Today's pick (Home's watchlist card, the lead of /watchlist's Tonight) is something to watch that day, so it
-- skips titles not out by `p_day`. A row with no release date isn't out yet either (same as the client's
-- isReleased). Same signature, so the grants stay.
create or replace function public.get_watchlist_pick(p_day date)
returns table (tmdb_id integer, media_type text, title text)
language sql
stable
as $$
  select i.tmdb_id, i.media_type, i.title
  from public.user_media_interactions i
  where i.user_id = (select auth.uid())
    and i.interaction_type = 'watchlist'
    and i.release_date <= p_day
  order by md5(i.tmdb_id::text || p_day::text)
  limit 1;
$$;
