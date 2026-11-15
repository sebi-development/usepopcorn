import { AuthClient } from '@supabase/auth-js'
import { PostgrestClient } from '@supabase/postgrest-js'
import { SESSION_KEY, sessionStore } from '@/lib/sessionStore'

// The Supabase client, put together the way supabase-js 2.105's createClient() does, but without
// bundling every part at startup: auth and the database load with the app, while realtime (live
// average, feed), storage (avatars) and functions (score lookups) load on first use. Same session
// storage key, so existing sessions carry over. The five @supabase packages are pinned together:
// upgrade them as one.

// Read before the client below takes the recovery tokens out of the hash
export const openedFromRecoveryLink = window.location.hash.includes('type=recovery')

const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const BASE = new URL(import.meta.env.VITE_SUPABASE_URL.replace(/\/?$/, '/'))
const endpoint = (path) => new URL(path, BASE).href

const auth = new AuthClient({
  url: endpoint('auth/v1'),
  headers: { Authorization: `Bearer ${KEY}`, apikey: KEY },
  storageKey: SESSION_KEY,
  storage: sessionStore,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  flowType: 'implicit',
})

// The signed-in user's token, or the anon key when signed out
const accessToken = async () => (await auth.getSession()).data.session?.access_token ?? KEY

// Every database, storage and function request carries the project key and the user's token
async function fetchWithAuth(input, init) {
  const headers = new Headers(init?.headers)
  if (!headers.has('apikey')) headers.set('apikey', KEY)
  if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${await accessToken()}`)
  return fetch(input, { ...init, headers })
}

const rest = new PostgrestClient(endpoint('rest/v1'), { schema: 'public', fetch: fetchWithAuth })

// The part of supabase-js's client the services use
const supabase = {
  auth,
  from: (relation) => rest.from(relation),
  rpc: (fn, args, options) => rest.rpc(fn, args, options),
}
export default supabase

let realtime
let storage
let functions

// Follows the session like createClient's realtime does: the new token on sign-in and refresh, none on sign-out
export function getRealtime() {
  realtime ??= import('@supabase/realtime-js').then(async ({ RealtimeClient }) => {
    const client = new RealtimeClient(endpoint('realtime/v1').replace(/^http/, 'ws'), {
      accessToken,
      fetch: fetchWithAuth,
      params: { apikey: KEY },
    })
    // Loaded after the startup SIGNED_IN event createClient's listener would have caught, so the
    // token is set here, before any channel joins (a join without it is anonymous, and RLS hides ratings)
    let token = await accessToken()
    await client.setAuth(token)
    auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.access_token !== token) {
        token = session?.access_token
        client.setAuth(token)
      } else if (event === 'SIGNED_OUT') {
        token = undefined
        client.setAuth()
      }
    })
    return client
  })
  return realtime
}

export function getStorage() {
  storage ??= import('@supabase/storage-js').then(({ StorageClient }) => new StorageClient(endpoint('storage/v1'), {}, fetchWithAuth))
  return storage
}

export function getFunctions() {
  functions ??= import('@supabase/functions-js').then(({ FunctionsClient }) => new FunctionsClient(endpoint('functions/v1'), { customFetch: fetchWithAuth }))
  return functions
}

// Closes every realtime channel on sign-out; nothing to do if realtime never loaded
export async function removeAllChannels() {
  if (realtime) await (await realtime).removeAllChannels()
}
