import { useState } from "react"
import { useForm } from "react-hook-form"
import Modal from "@/components/ui/Modal"
import Form from "@/components/ui/Form"
import Button from "@/components/ui/Button"
import useUpdateProfile from "@/features/profile/hooks/useUpdateProfile"
import CountrySelect from "@/features/profile/components/CountrySelect"
import DeleteAccountButton from "@/features/profile/components/DeleteAccountButton"
import PasswordChecklist from "@/features/auth/components/PasswordChecklist"
import { PASSWORD_RULES } from "@/utils/passwordRules"

const CARD_CLASS = "rounded-xl border border-surface-100 bg-white/2"
const CARD_TITLE_CLASS = "text-sm font-semibold leading-snug tracking-tight text-white"

export default function EditProfileModal({ onClose, profileData }) {
  const { updateUserProfile, isUpdating } = useUpdateProfile()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const { register, handleSubmit, getValues, trigger, resetField, control, formState: { errors }, reset } = useForm({
    defaultValues: {
      username: profileData?.username || "",
      country: profileData?.country || "",
      currentPassword: "",
      password: "",
      confirmPassword: "",
    }
  })

  // Cancel drops what was typed, so a hidden half-filled password is never sent
  function cancelPasswordChange() {
    resetField("currentPassword")
    resetField("password")
    resetField("confirmPassword")
    setIsChangingPassword(false)
  }

  function onSubmit(data) {
    const { username, country, currentPassword, password } = data

    const updates = { username, country }
    if (password) Object.assign(updates, { password, currentPassword })

    updateUserProfile(updates, {
      onSuccess: () => {
        onClose()
        reset()
      }
    })
  }

  return (
    <Modal
      title="Edit profile"
      subtitle="Change how others see you and where you watch."
      onClose={onClose}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Input
          {...register("username", { minLength: { value: 2, message: "Too short" } })}
          label="Username"
          error={errors.username}
        />

        <CountrySelect {...register("country")} />

        {isChangingPassword ? (
          <div className={`${CARD_CLASS} flex flex-col gap-4 p-4`}>
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <h3 className={CARD_TITLE_CLASS}>New password</h3>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 min-h-11 sm:min-h-0 -mr-2 sm:mr-0"
                onClick={cancelPasswordChange}
                type="button"
              >
                Cancel
              </Button>
            </div>

            <Form.Input
              {...register("currentPassword", { required: "Enter your current password" })}
              type="password"
              label="Current password"
              error={errors.currentPassword}
            />

            <Form.Input
              {...register("password", {
                ...PASSWORD_RULES,
                validate: {
                  ...PASSWORD_RULES.validate,
                  different: v => v !== getValues("currentPassword") || "Must differ from your current password",
                },
                onChange: () => {
                  if (getValues("confirmPassword")) {
                    trigger("confirmPassword")
                  }
                }
              })}
              type="password"
              label="New password"
              error={errors.password}
            />

            <PasswordChecklist control={control} />

            <Form.Input
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value, formValues) => value === formValues.password || "Passwords do not match"
              })}
              type="password"
              label="Confirm password"
              error={errors.confirmPassword}
            />
          </div>
        ) : (
          <div className={`${CARD_CLASS} flex items-center justify-between gap-3 sm:gap-4 px-4 py-3 sm:p-4`}>
            <h3 className={CARD_TITLE_CLASS}>Password</h3>
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0 min-h-11 sm:min-h-0"
              onClick={() => setIsChangingPassword(true)}
              type="button"
            >
              Change
            </Button>
          </div>
        )}
        <Form.Button isLoading={isUpdating} className="sm:mt-4 text-xs!">Save changes</Form.Button>
      </Form>

      <DeleteAccountButton />
    </Modal>
  )
}
