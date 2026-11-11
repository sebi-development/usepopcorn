-- REFERENCE SNAPSHOT of the live DB (pulled 2026-11-11, after rating_edits). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_best_rated_since(p_user_id uuid, p_since timestamp with time zone)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  select coalesce(jsonb_object_agg(t.type, to_jsonb(t)), '{}'::jsonb)
  from (
    select distinct on (type) type, tmdb_id, title, poster_path, score as rating
    from public.ratings
    where user_id = p_user_id
      and created_at >= p_since
      and type in ('movie', 'tv')
    order by type, score desc, created_at desc
  ) t;
$function$
