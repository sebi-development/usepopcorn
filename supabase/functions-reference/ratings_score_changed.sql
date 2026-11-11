-- REFERENCE SNAPSHOT of the live DB (pulled 2026-11-11, after rating_edits). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.ratings_score_changed()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  new.previous_score = old.score;
  new.updated_at = now();
  return new;
end;
$function$
