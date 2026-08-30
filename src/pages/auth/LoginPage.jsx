import { useForm } from 'react-hook-form'
import Form from '../../components/Form'
import AlertBanner from '../../components/AlertBanner'
import AuthCard from '../../features/auth/components/AuthCard'
import { useAuth } from '../../features/auth/hooks/useAuth'
import ArrowLink from '../../components/ArrowLink'
import { getCountry } from '../../utils/getCountry'

export default function LoginPage() {
  const { login } = useAuth()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm()

  async function onSubmit(data) {
    try {
      await login(data)
    } catch (error) {
      setError('root', { type: 'server', message: error.message })
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your account to continue">
      {errors.root && <AlertBanner variant='warning' message={errors.root.message} />}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Input
          {...register('email', { required: 'Email is required' })}
          type="email"
          label="Email"
          error={errors.email}
        />
        <Form.Input
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Minimum 6 characters' }
          })}
          type="password"
          label="Password"
          error={errors.password}
        />
        <Form.Button isLoading={isSubmitting}>Sign in</Form.Button>
      </Form>

      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-text-muted text-center">
          No account yet?{' '}
          {/* Prefetch on hover — fires before the user even navigates to /register */}
          <ArrowLink to="/register" className="text-primary-light hover:text-text font-medium" onMouseEnter={() => getCountry()}>
            Register
          </ArrowLink>
        </p>
        <ArrowLink to="/forgot-password" className="text-sm text-text-muted hover:text-text">
          Forgot your password?
        </ArrowLink>
      </div>
    </AuthCard>
  )
}