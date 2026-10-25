-- REFERENCE SNAPSHOT of the live DB (pulled 2026-10-25). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_watchlist_pick(p_day date)
 RETURNS TABLE(tmdb_id integer, media_type text, title text)
 LANGUAGE sql
 STABLE
AS $function$
  select i.tmdb_id, i.media_type, i.title
  from public.user_media_interactions i
  where i.user_id = (select auth.uid()) and i.interaction_type = 'watchlist'
  order by md5(i.tmdb_id::text || p_day::text)
  limit 1;
$function$
