-- REFERENCE SNAPSHOT of the live DB (pulled 2026-10-01). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, country)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'country'
  );
  RETURN NEW;
END;
$function$
