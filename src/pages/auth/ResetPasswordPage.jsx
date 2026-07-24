import { useForm, useWatch } from 'react-hook-form'
import { HiOutlineLockClosed, HiCheck, HiXMark } from 'react-icons/hi2'
import Form from '../../components/Form'
import AuthCard from '../../features/auth/components/AuthCard'
import ArrowLink from '../../features/auth/components/ArrowLink'
import usePasswordRecovery from '../../features/auth/hooks/usePasswordRecovery'
import { useAuth } from '../../features/auth/hooks/useAuth'
import ErrorBadge from '../../components/ErrorBadge'

// Helper component for the animated checklist items
function Requirement({ met, text }) {
  return (
    <li
      className={`
        flex items-center gap-2 text-sm transition-all duration-300
        ${met ? 'text-primary-light' : 'text-text-muted opacity-50'}
      `}
    >
      {met ? (
        <HiCheck className="w-4 h-4 shrink-0" />
      ) : (
        <HiXMark className="w-4 h-4 shrink-0" />
      )}
      <span>{text}</span>
    </li>
  )
}

// Helper component for isolating the 'useWatch' hook (optimalization) 
function PasswordChecklist({ control }) {
  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' })

  const reqs = {
    length: passwordValue.length >= 8,
    lower: /[a-z]/.test(passwordValue),
    upper: /[A-Z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue)
  }

  return (
    <ul className="flex flex-col gap-1.5 px-1 py-2">
      <Requirement met={reqs.lower} text="At least one lowercase letter" />
      <Requirement met={reqs.upper} text="At least one uppercase letter" />
      <Requirement met={reqs.number} text="At least one number" />
      <Requirement met={reqs.length} text="Minimum 8 characters" />
    </ul>
  )
}

export default function ResetPasswordPage() {
  const { register, handleSubmit, control, setError, formState: { errors, isSubmitting } } = useForm()

  const { isRecoveryReady, isInvalid } = usePasswordRecovery()
  const { resetPassword } = useAuth()

  const onSubmit = async (data) => {
    try {
      await resetPassword(data)
    } catch (error) {
      setError('root', { type: 'server', message: error.message })
    }
  }

  if (!isRecoveryReady && !isInvalid) return null

  if (isInvalid) return <AuthCard title="Invalid link" subtitle="Link is invalid or expired. Please try again sending new one">
    {/* Fallback to reset password */}
    <div className="text-center mt-2">
      <ArrowLink
        to="/forgot-password"
        direction="left"
        className="text-sm text-text-muted hover:text-text"
      >
        Request a new link
      </ArrowLink>
    </div>
  </AuthCard>
  return (
    <AuthCard title="Create new password" subtitle="Please enter your new, secure password below.">
      {errors.root && <ErrorBadge message={errors.root.message} />}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Input
          {...register('password', {
            required: 'Password is required',
            validate: {
              length: v => v.length >= 8 || 'Minimum 8 characters',
              lower: v => /[a-z]/.test(v) || 'Needs a lowercase letter',
              upper: v => /[A-Z]/.test(v) || 'Needs an uppercase letter',
              number: v => /[0-9]/.test(v) || 'Needs a number',
            }
          })}
          type="password"
          label="New Password"
          icon={HiOutlineLockClosed}
          error={errors.password}
        />

        <PasswordChecklist control={control} />

        <Form.Input
          {...register('passwordConfirm', {
            required: 'Please confirm your password',
            // formValues gives us access to the current password without needing 'watch'
            validate: (value, formValues) => value === formValues.password || 'Passwords do not match'
          })}
          type="password"
          label="Confirm Password"
          icon={HiOutlineLockClosed}
          error={errors.passwordConfirm}
        />

        <Form.Button isLoading={isSubmitting}>
          Reset password
        </Form.Button>
      </Form>

      <div className="text-center mt-2">
        <ArrowLink to="/login" direction="left" className="text-sm text-text-muted hover:text-text">
          Cancel and return to Login
        </ArrowLink>
      </div>

    </AuthCard>
  )
}