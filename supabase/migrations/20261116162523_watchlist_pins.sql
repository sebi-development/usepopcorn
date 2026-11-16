-- Up next on /watchlist: up to 3 watchlist titles pinned by the user, in the order they were pinned.
-- A pin is part of the watchlist row, so taking a title off the list takes its pin with it.

-- Null = not pinned. Nullable, no default: a metadata-only change, no table rewrite.
alter table public.user_media_interactions add column if not exists pinned_at timestamptz;

-- Pinning is the first UPDATE on this table, and it may change pinned_at only. Supabase's default
-- table-level UPDATE grant covers every column, so it goes before the column grant.
-- Adds are INSERT ... ON CONFLICT DO NOTHING, which needs no UPDATE privilege.
revoke update on public.user_media_interactions from anon, authenticated;
grant update (pinned_at) on public.user_media_interactions to authenticated;

-- Own watchlist rows only (a favourite can't be pinned)
drop policy if exists "Users can pin own watchlist titles" on public.user_media_interactions;
create policy "Users can pin own watchlist titles"
  on public.user_media_interactions
  for update
  to authenticated
  using ((select auth.uid()) = user_id and interaction_type = 'watchlist')
  with check ((select auth.uid()) = user_id and interaction_type = 'watchlist');

-- At most 3 pins per user. The client checks its cached list first, so this only catches a pin sent
-- from a stale tab or a second device. Security invoker: the count reads the caller's own rows (RLS).
create or replace function public.limit_watchlist_pins()
returns trigger
language plpgsql
set search_path = ''
as $function$
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
$function$;

-- Fires on a new pin only: unpinning, or re-pinning a pinned title, never counts
drop trigger if exists limit_watchlist_pins on public.user_media_interactions;
create trigger limit_watchlist_pins
  before update of pinned_at on public.user_media_interactions
  for each row
  when (old.pinned_at is null and new.pinned_at is not null)
  execute function public.limit_watchlist_pins();
