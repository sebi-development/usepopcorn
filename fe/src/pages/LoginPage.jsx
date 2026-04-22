import Form from '../components/Form'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router'
import { login } from '../store/authSlice'
import ErrorBadge from '../components/ErrorBadge'
import { useState } from 'react'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [formError, setformError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    // 1. get email & password from the form fields
    const email = e.target.email.value
    const password = e.target.password.value
    // 2. fetch POST /auth/login with { email, password }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setformError(data.error)
        return
      }

      // 3. dispatch login({ user, token }) from response
      dispatch(login({ user: data.user, token: data.token }))

      // 4. navigate('/', { replace: true })
      navigate('/', { replace: true })

    } catch (error) {
      setformError('Invalid credentials. Please try again.')
    }
  }

  return (
    <main className="main main-auth">
      <div className="auth-box">
        <h2 className="auth-title">Welcome back</h2>

        {formError && <ErrorBadge message={formError} />}

        <Form onSubmit={handleSubmit}>
          <Form.Input name="email" type="email" label="Email" />
          <Form.Input name="password" type="password" label="Password" />
          <Form.Button>Sign in</Form.Button>
        </Form>

        <p className="auth-link">
          No account yet? <Link to="/register">Register</Link>
        </p>
      </div>
    </main>
  )
}