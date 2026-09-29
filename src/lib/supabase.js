import { createClient } from '@supabase/supabase-js'

// supabase-js consumes the auth tokens and clears the URL hash shortly after init, which can
// happen before the lazy reset-password chunk renders, so the marker is captured synchronously.
export const openedFromRecoveryLink = window.location.hash.includes('type=recovery')

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default supabase