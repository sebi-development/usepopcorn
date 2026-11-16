-- REFERENCE SNAPSHOT of the live DB (pulled 2026-11-16). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_average_rating(p_tmdb_id integer, p_type text DEFAULT NULL::text)
 RETURNS numeric
 LANGUAGE sql
 STABLE
AS $function$
  select round(avg(score)::numeric, 1)
  from public.ratings
  where tmdb_id = p_tmdb_id
    and (p_type is null or type = p_type);
$function$

