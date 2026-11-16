-- Watchlists and favorites become public to signed-in users, like ratings (ratings_select_all), so
-- profiles can show them and "Watch together" can compare two lists. The table holds only those two
-- types (check constraint), so `true` is exactly "watchlist and favorite rows". Every existing reader
-- (the client service, get_my_title_state, get_my_media_state, get_watchlist_pick) already filters by
-- user, so none of them starts returning other users' rows. Writes stay own-rows only.
drop policy if exists "Users can read own interactions" on public.user_media_interactions;
drop policy if exists "Signed-in users can read all interactions" on public.user_media_interactions;
create policy "Signed-in users can read all interactions"
  on public.user_media_interactions
  for select
  to authenticated
  using (true);

-- /watchlist's "Your friends rated these" shelf: for each title on the signed-in user's watchlist that
-- people they follow have rated, those friends' average score and how many rated it. At most one row
-- per watchlist title (a few hundred), so no paging; the client joins the rows to its cached list.
-- Security invoker, default EXECUTE grants as for the other read RPCs: anon gets no rows (no auth.uid()).
create or replace function public.get_watchlist_friends_ratings()
returns table (media_type text, tmdb_id int, avg_score numeric, ratings_count int)
language sql
stable
set search_path = ''
as $$
  select w.media_type, w.tmdb_id, round(avg(r.score), 1), count(*)::int
  from public.user_media_interactions w
  join public.follows f on f.follower_id = w.user_id
  join public.ratings r on r.user_id = f.following_id and r.type = w.media_type and r.tmdb_id = w.tmdb_id
  where w.user_id = (select auth.uid()) and w.interaction_type = 'watchlist'
  group by w.media_type, w.tmdb_id
  order by 3 desc, 4 desc;
$$;
