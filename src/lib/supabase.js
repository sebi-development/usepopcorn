import { createClient } from '@supabase/supabase-js'

export const openedFromRecoveryLink = window.location.hash.includes('type=recovery')

let remember = null
export const setRemember = (value) => { remember = value }

const storage = {
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

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { storage } }
)

export default supabase