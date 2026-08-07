import { useForm } from 'react-hook-form'
import Form from '../../components/Form'
import AlertBanner from '../../components/AlertBanner'
import AuthCard from '../../features/auth/components/AuthCard'
import { useAuth } from '../../features/auth/hooks/useAuth'
import ArrowLink from '../../features/auth/components/ArrowLink'
import { getCountry } from '../../utils/getCountry'

export default function RegisterPage() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm()  
  const { register: registerUser } = useAuth()

  async function onSubmit(data) {
    try {
      await registerUser(data)
    } catch (error) {
      setError('root', { type: 'server', message: error.message })
    }
  }

  return (
    <AuthCard title="Create an account" subtitle="Join us and dive into the world of cinema">
      {errors.root && <AlertBanner message={errors.root.message} />}

      {/* Prefetch fires on hover — earliest intent signal. By submit time, await is instant. */}
      <Form onSubmit={handleSubmit(onSubmit)} onMouseEnter={() => getCountry()}>
        <Form.Input
          {...register('email', { required: 'Email is required' })}
          type="email"
          label="Email"
          error={errors.email}
        />
        <Form.Input
          {...register('username', { required: 'Username is required' })}
          type="text"
          label="Username"
          error={errors.username}
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
        <Form.Input
          {...register('passwordConfirm', {
            required: 'Please confirm your password',
            validate: (value, formValues) => value === formValues.password || 'Passwords do not match'
          })}
          type="password"
          label="Confirm Password"
          error={errors.passwordConfirm}
        />

        <Form.Button isLoading={isSubmitting}>Sign up</Form.Button>
      </Form>

      <div className="flex flex-col items-center gap-1 mt-2">
        <p className="text-sm text-text-muted">Already have an account?</p>
        <ArrowLink
          to="/login"
          direction="left"
          className="text-sm font-medium text-primary-light hover:text-text"
        >
          Login
        </ArrowLink>
      </div>
    </AuthCard>
  )
}