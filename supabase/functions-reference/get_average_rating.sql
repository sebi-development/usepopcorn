-- REFERENCE SNAPSHOT of the live DB (pulled 2026-10-02). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_average_rating(p_tmdb_id integer)
 RETURNS numeric
 LANGUAGE sql
 STABLE
AS $function$
  SELECT ROUND(AVG(score)::NUMERIC, 1)
  FROM public.ratings
  WHERE tmdb_id = p_tmdb_id;
$function$
