import { useNavigate } from "react-router"
import toast from "react-hot-toast"
import { sendPasswordReset, signIn, signUp, updatePassword } from "@/services/auth"

// The auth forms' actions: the service call, then where the app goes next. A failure throws to the form.
export function useAuth() {
  const navigate = useNavigate()

  async function login(values) {
    await signIn(values)
    navigate('/browse', { replace: true })
  }

  async function register(values) {
    await signUp(values)
    navigate('/browse', { replace: true })
  }

  const forgotPassword = ({ email }) => sendPasswordReset(email)

  async function resetPassword({ password }) {
    await updatePassword(password)
    toast.success('Password updated successfully')
    navigate('/login', { replace: true })
  }

  return { login, register, forgotPassword, resetPassword }
}
