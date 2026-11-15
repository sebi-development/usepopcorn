// Where the Supabase session is stored, readable without loading the client: the route loaders decide
// signed-in redirects from it, so signed-out pages never download auth. lib/supabase.js stores through
// it, and vite.config.js builds the same key for the index.html preload hint.
export const SESSION_KEY = `sb-${new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`

let remember = null
export const setRemember = (value) => { remember = value }

// "Remember me" keeps the session in localStorage, otherwise it lasts for the tab (sessionStorage)
export const sessionStore = {
  getItem: (key) => sessionStorage.getItem(key) ?? localStorage.getItem(key),
  setItem(key, value) {
    const useLocal = remember ?? sessionStorage.getItem(key) === null
    const [to, from] = useLocal ? [localStorage, sessionStorage] : [sessionStorage, localStorage]
    to.setItem(key, value)
    from.removeItem(key)
  },
  removeItem(key) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

export const hasStoredSession = () => sessionStore.getItem(SESSION_KEY) !== null

// A sign-up confirmation or other sign-in link brings its tokens in the hash: only the client turns them into a session
export const hasAuthRedirect = () => /access_token=|error_description=/.test(window.location.hash)
