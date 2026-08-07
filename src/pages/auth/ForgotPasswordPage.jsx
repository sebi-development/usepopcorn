import { HiOutlineEnvelope } from "react-icons/hi2"
import Form from "../../components/Form"
import AuthCard from "../../features/auth/components/AuthCard"
import ArrowLink from "../../features/auth/components/ArrowLink"
import { useAuth } from "../../features/auth/hooks/useAuth"
import { useForm } from "react-hook-form"
import { useState } from "react"
import AlertBanner from "../../components/AlertBanner"

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm()

  const [isSubmitted, setIsSubmitted] = useState(false)

  async function onSubmit(data) {
    try {
      await forgotPassword(data)
      setIsSubmitted(true)
    } catch (error) {
      setError('root', { type: 'server', message: error.message })
    }
  }

  if (isSubmitted) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle="We've sent a password reset link to your email address. It might take a minute to arrive."
      >
        <div className="flex flex-col items-center gap-6 mt-2">
          <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center">
            <HiOutlineEnvelope className="w-8 h-8 text-primary-light" />
          </div>

          <ArrowLink
            to="/login"
            direction="left"
            className="text-sm font-medium text-text-muted hover:text-text"
          >
            Back to Login
          </ArrowLink>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Reset Password" subtitle="We'll email you a link to reset your password.">
      {errors.root && <AlertBanner message={errors.root.message} />}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Input
          {...register('email', { required: 'Email is required' })}
          type="email"
          label="Email address"
          icon={HiOutlineEnvelope}
          error={errors.email}
        />
        <Form.Button isLoading={isSubmitting}>Send reset link</Form.Button>
      </Form>

      <div className="text-center mt-2">
        <ArrowLink
          to="/login"
          direction="left"
          className="text-sm font-medium text-text-muted hover:text-text"
        >
          Go back to Login
        </ArrowLink>
      </div>
    </AuthCard>
  )
}