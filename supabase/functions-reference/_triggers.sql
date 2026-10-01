-- REFERENCE SNAPSHOT of the live DB (pulled 2026-10-01). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
CREATE TRIGGER ratings_set_updated_at BEFORE UPDATE ON public.ratings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
