import supabase from '@/lib/supabase'
import { setRemember } from '@/lib/sessionStore'
import { getCountry } from '@/services/location'

// Sign-in, sign-up and the password flows. Only the auth pages import this, so it stays out of the
// entry chunk; session reads and sign-out are in services/session.js.

// `remember` keeps the session in localStorage (it outlives the browser) instead of sessionStorage
export async function signIn({ email, password, remember }) {
  setRemember(remember)
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
}

// The country (from the IP, null when unknown) goes into the metadata the new profile is created from
export async function signUp({ email, password, username }) {
  const country = await getCountry()
  setRemember(true)
  const { error } = await supabase.auth.signUp({ email, password, options: { data: { username, country } } })
  if (error) throw new Error(error.message)
}

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
  if (error) throw new Error(error.message)
}

export async function updatePassword(password) {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)
}
