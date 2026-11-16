-- REFERENCE SNAPSHOT of the live DB (pulled 2026-11-16, after watchlist_pins). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.limit_watchlist_pins()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if (
    select count(*)
    from public.user_media_interactions
    where user_id = new.user_id and interaction_type = 'watchlist' and pinned_at is not null
  ) >= 3 then
    raise exception 'Up next holds 3 titles. Unpin one first.';
  end if;
  return new;
end;
$function$

