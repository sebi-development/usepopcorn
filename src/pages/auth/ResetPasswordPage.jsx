import { useForm } from 'react-hook-form'
import { HiOutlineLockClosed } from 'react-icons/hi2'
import Form from '@/components/ui/Form'
import InfoCard from '@/components/ui/InfoCard'
import ArrowLink from '@/components/ui/ArrowLink'
import usePasswordRecovery from '@/features/auth/hooks/usePasswordRecovery'
import { useAuth } from '@/features/auth/hooks/useAuth'
import AlertBanner from '@/components/ui/AlertBanner'
import PasswordChecklist from '@/features/auth/components/PasswordChecklist'
import { PASSWORD_RULES } from '@/utils/passwordRules'

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

  if (isInvalid) return <InfoCard title="Invalid link" subtitle="Link is invalid or expired. Please try again sending new one">
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
  </InfoCard>
  return (
    <InfoCard title="Create new password" subtitle="Please enter your new, secure password below.">
      {errors.root && <AlertBanner message={errors.root.message} />}
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Input
          {...register('password', PASSWORD_RULES)}
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

    </InfoCard>
  )
}