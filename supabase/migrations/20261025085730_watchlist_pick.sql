-- Home's "Tonight's pick": one title from the signed-in user's watchlist for the given day (the client's
-- local date). Ranking by a hash of title + day keeps the pick the same on every device all day, and
-- adding or removing another title only moves it when that title wins or was the pick.
-- Security invoker: the own-rows RLS policy on user_media_interactions applies. Empty watchlist = no row.
create or replace function public.get_watchlist_pick(p_day date)
returns table (tmdb_id int, media_type text, title text)
language sql
stable
as $$
  select i.tmdb_id, i.media_type, i.title
  from public.user_media_interactions i
  where i.user_id = (select auth.uid()) and i.interaction_type = 'watchlist'
  order by md5(i.tmdb_id::text || p_day::text)
  limit 1;
$$;
