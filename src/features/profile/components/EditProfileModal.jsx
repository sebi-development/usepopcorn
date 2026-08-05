import { useForm } from "react-hook-form"
import Modal from "../../../components/Modal"
import Form from "../../../components/Form"
import useUpdateProfile from "../hooks/useUpdateProfile"
import CountrySelect from "./CountrySelect"
import DeleteAccountButton from "./DeleteAccountButton"

export default function EditProfileModal({ onClose, profileData }) {
  const { updateUserProfile, isUpdating } = useUpdateProfile()
    const { register, handleSubmit, getValues, trigger, formState: { errors }, reset } = useForm({
    defaultValues: {
      username: profileData?.username || "",
      country: profileData?.country || "",
      password: "",
      confirmPassword: "",
    }
  })

  function onSubmit(data) {
    const { username, country, password } = data

    const updates = { username, country }
    if (password) updates.password = password

    updateUserProfile(updates, {
      onSuccess: () => {
        onClose()
        reset()
      }
    })
  }

  return (
    <Modal
      title="Edit Profile"
      subtitle="Update your username, location, or password."
      onClose={onClose}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Input
          {...register("username", { minLength: { value: 2, message: "Too short" } })}
          label="Username"
          error={errors.username}
        />

        <CountrySelect {...register("country")} />

        <Form.Input
          {...register("password", { 
            minLength: { value: 6, message: "Minimum 6 characters" },
            onChange: () => {
              if (getValues("confirmPassword")) {
                trigger("confirmPassword")
              }
            }
          })}
          type="password"
          label="New Password"
          placeholder="Leave blank to keep current"
          error={errors.password}
        />
        
        <Form.Input
          {...register("confirmPassword", {
            validate: value => {
              const currentPassword = getValues("password")
              if (!currentPassword) return true
              return value === currentPassword || "Passwords do not match"
            }
          })}
          type="password"
          label="Confirm Password"
          placeholder="Leave blank to keep current"
          error={errors.confirmPassword}
        />
        
        <Form.Button isLoading={isUpdating}>Save changes</Form.Button>
      </Form>

      <DeleteAccountButton />
    </Modal>
  )
}