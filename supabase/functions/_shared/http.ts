// Request and response helpers shared by the Edge Functions. Folders starting with `_` are not
// deployed as functions of their own; each function that imports from here bundles a copy.

// The app calls functions from another origin with an Authorization header, so the browser first
// sends an OPTIONS request (preflight) asking whether that's allowed. These headers say yes.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: corsHeaders });
}

// Answers the preflight and rejects every method but POST. Null means the request can go on.
export function preflight(req: Request): Response | null {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  return null;
}

// Supabase runtime: keeps the isolate alive until the promise settles, after the response is sent
declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

// Work that runs after the response is sent. Nobody awaits it, so a failure is only logged.
export function inBackground(task: Promise<unknown>): void {
  EdgeRuntime.waitUntil(task.catch(console.error));
}
