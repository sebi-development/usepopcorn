import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProfile } from "../../../services/profiles"
import useCurrentUser from "../../auth/hooks/useCurrentUser"
import toast from "react-hot-toast"

export default function useUpdateProfile() {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const { mutate: updateUserProfile, isPending: isUpdating } = useMutation({
    mutationFn: (updateData) => updateProfile(updateData, currentUser?.id),
    onSuccess: (updatedUser) => {
      toast.success("Profile updated successfully")
      queryClient.invalidateQueries({ queryKey: ['profile', currentUser?.id] })
      queryClient.setQueryData(['currentUser'], updatedUser)
    },
    onError: (err) => toast.error(err.message)
  })

  return { updateUserProfile, isUpdating }
}