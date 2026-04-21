import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../store/authSlice'
import Form from '../components/Form'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [formError, setFormError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    const email = e.target.email.value
    const name = e.target.username.value
    const password = e.target.password.value
    const confirmPassword = e.target.passwordConfirm.value

    if (password !== confirmPassword) {
      setFormError('Passwords do not match')
      return
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })
      const data = await res.json()
      dispatch(login({ user: data.user, token: data.token }))
      navigate('/', { replace: true })
    } catch (error) {
      setFormError('Something went wrong. Please try again.')
    }
  }

  return (
    <main className="main .main-auth ">
      <div className="auth-box">
        <h2 className="auth-title">Join us and dive into world of cinema</h2>

        <Form onSubmit={handleSubmit} externalError={formError}>
          <Form.Input name="email" type="email" label="Email" />
          <Form.Input name="username" type="text" label="Username" />
          <Form.Input name="password" type="password" label="Password" />
          <Form.Input name="passwordConfirm" type="password" label="Confirm Password" />
          <Form.Error />
          <Form.Button>Sign up</Form.Button>
        </Form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  )
}