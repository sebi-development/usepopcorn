import { useNavigate } from "react-router"
import supabase from "../../../lib/supabase"
import toast from "react-hot-toast"
import { getCountry } from "../../../utils/getCountry"

export function useAuth() {
  const navigate = useNavigate()

  async function login({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    navigate('/browse', { replace: true })
  }

  async function register({ email, password, username }) {
    // By submit time, this Promise is already resolved from the onMouseEnter prefetch.
    // The await is instant — it just reads the cached value.
    const country = await getCountry()

    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username, country } }
    })
    if (error) throw new Error(error.message)
    navigate('/browse', { replace: true })
  }

  async function forgotPassword({ email }) {
    const redirectTo = window.location.origin + '/reset-password'
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) throw new Error(error.message)
  }

  async function resetPassword({ password }) {
    const { error } = await supabase.auth.updateUser({password})
    if (error) throw new Error(error.message)
    toast.success('Password updated successfully')
    navigate('/login', { replace: true })

  }

  return { login, register, forgotPassword, resetPassword }
}