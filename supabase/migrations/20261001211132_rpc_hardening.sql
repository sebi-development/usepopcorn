-- Read-only RPCs that were SECURITY DEFINER + VOLATILE (the defaults nobody chose).
-- DEFINER bypassed RLS while EXECUTE is granted to anon, so anyone holding the public anon key could
-- read any user's stats / heatmap / streak by uuid. RLS already lets every signed-in user read
-- ratings and profiles, so INVOKER returns the same rows to the app and nothing to anon.
-- STABLE: they only read, so they run in a read-only transaction and can be planned as such.
alter function public.get_extended_streak(uuid) stable security invoker;
alter function public.get_profile_heatmap(uuid, integer) stable security invoker;
alter function public.get_recent_weekly_activity(uuid, integer) stable security invoker;
alter function public.get_suggested_users(uuid) stable;

-- Same change for get_profile_stats, plus its seriesRated count: it filtered on type = 'series',
-- but ratings.type is 'movie' | 'tv' (ratings_type_check), so it always returned 0.
create or replace function public.get_profile_stats(p_user_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with my_ratings as (
    select * from ratings where user_id = p_user_id
  ),
  genre_counts as (
    select
      type,
      unnest(genre_ids) as genre_id,
      count(*) as genre_count
    from my_ratings
    group by type, genre_id
  ),
  ranked_genres as (
    select
      type, genre_id, genre_count,
      row_number() over (partition by type order by genre_count desc) as rank
    from genre_counts
  )
  select jsonb_build_object(
    'totalRated', (select count(*) from my_ratings),
    'averageScore', (select round(avg(score)::numeric, 1) from my_ratings),
    'moviesRated', (select count(*) filter (where type = 'movie') from my_ratings),
    'seriesRated', (select count(*) filter (where type = 'tv') from my_ratings),
    'totalWatchHours', (select round(sum(runtime) filter (where type = 'movie') / 60.0, 1) from my_ratings),
    'topGenres', (
      select jsonb_agg(jsonb_build_object('type', type, 'genreId', genre_id, 'count', genre_count))
      from ranked_genres
      where rank <= 3
    )
  )
  from my_ratings
  limit 1;
$$;

-- `(select auth.uid())` is computed once (InitPlan) and, unlike the bare call, is a plain parameter
-- the planner may use as an index condition on ratings.user_id under RLS.
create or replace function public.get_my_media_state()
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'favorites', coalesce((
      select jsonb_agg(tmdb_id)
      from public.user_media_interactions
      where user_id = (select auth.uid()) and interaction_type = 'favorite'
    ), '[]'::jsonb),
    'watchlist', coalesce((
      select jsonb_agg(tmdb_id)
      from public.user_media_interactions
      where user_id = (select auth.uid()) and interaction_type = 'watchlist'
    ), '[]'::jsonb),
    'ratings', coalesce((
      select jsonb_object_agg(tmdb_id::text, score)
      from public.ratings
      where user_id = (select auth.uid())
    ), '{}'::jsonb)
  );
$$;

-- The two functions that must stay SECURITY DEFINER.
-- handle_new_user (signup trigger) had no search_path; its body is fully schema-qualified.
alter function public.handle_new_user() set search_path = '';
-- delete_user deletes the caller's own auth.users row; an anonymous caller has no row to delete.
revoke execute on function public.delete_user() from public, anon;

-- Unused since the Home rows were seeded from get_best_rated_since; no callers in src/.
drop function if exists public.get_recommendation_seed(uuid);
