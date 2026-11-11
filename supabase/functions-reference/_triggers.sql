-- REFERENCE SNAPSHOT of the live DB (pulled 2026-11-11, after rating_edits). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
CREATE TRIGGER ratings_score_changed BEFORE UPDATE OF score ON public.ratings FOR EACH ROW WHEN ((old.score IS DISTINCT FROM new.score)) EXECUTE FUNCTION ratings_score_changed();
