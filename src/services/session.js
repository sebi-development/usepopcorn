import supabase, { removeAllChannels } from '@/lib/supabase'

// Session reads and sign-out, for the signed-in shell (AppLayout, browseLoader, the user menu) and
// sign-in links: keep its imports to the Supabase client alone. Sign-in lives in services/auth.js.

// The stored session, or null. Waits for any token exchange in progress (a recovery link), so it is
// safe to call at startup.
export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// Calls `callback(session, event)` on every sign-in, sign-out and token refresh; returns the unsubscribe
export function onSessionChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => callback(session, event))
  return () => subscription.unsubscribe()
}

// Ends the session and closes every realtime channel; the caller clears the query cache
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
  await removeAllChannels()
}
