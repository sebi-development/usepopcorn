-- REFERENCE SNAPSHOT of the live DB (pulled 2026-11-16). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_watchlist_friends_ratings()
 RETURNS TABLE(media_type text, tmdb_id integer, avg_score numeric, ratings_count integer)
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
  select w.media_type, w.tmdb_id, round(avg(r.score), 1), count(*)::int
  from public.user_media_interactions w
  join public.follows f on f.follower_id = w.user_id
  join public.ratings r on r.user_id = f.following_id and r.type = w.media_type and r.tmdb_id = w.tmdb_id
  where w.user_id = (select auth.uid()) and w.interaction_type = 'watchlist'
  group by w.media_type, w.tmdb_id
  order by 3 desc, 4 desc;
$function$
