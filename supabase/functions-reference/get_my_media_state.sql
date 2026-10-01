-- REFERENCE SNAPSHOT of the live DB (pulled 2026-10-01). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_my_media_state()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  select jsonb_build_object(
    'favorites', coalesce((
      select jsonb_agg(tmdb_id)
      from public.user_media_interactions
      where user_id = auth.uid() and interaction_type = 'favorite'
    ), '[]'::jsonb),
    'watchlist', coalesce((
      select jsonb_agg(tmdb_id)
      from public.user_media_interactions
      where user_id = auth.uid() and interaction_type = 'watchlist'
    ), '[]'::jsonb),
    'ratings', coalesce((
      select jsonb_object_agg(tmdb_id::text, score)
      from public.ratings
      where user_id = auth.uid()
    ), '{}'::jsonb)
  );
$function$
