import { createClient } from "npm:@supabase/supabase-js@2.105.1";

// The secret key runs as service_role, which bypasses RLS: that's how functions write the cache
// tables signed-in users can only read. Supabase injects it into every function's environment, so
// it never reaches the browser. SUPABASE_SECRET_KEYS holds the new-style keys as JSON; the legacy
// service_role key is the fallback.
const secretKey = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default ??
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

export const admin = createClient(Deno.env.get("SUPABASE_URL")!, secretKey, {
  auth: { persistSession: false },
});
