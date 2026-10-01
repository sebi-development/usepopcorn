-- REFERENCE SNAPSHOT of the live DB (pulled 2026-10-01). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_profile_stats(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    'seriesRated', (select count(*) filter (where type = 'series') from my_ratings),
    'totalWatchHours', (select round(sum(runtime) filter (where type = 'movie') / 60.0, 1) from my_ratings),
    'topGenres', (
      select jsonb_agg(jsonb_build_object('type', type, 'genreId', genre_id, 'count', genre_count))
      from ranked_genres
      where rank <= 3
    )
  )
  from my_ratings
  limit 1;
$function$
