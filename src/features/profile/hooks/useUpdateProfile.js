import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProfile } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import toast from "react-hot-toast"
import queryKeys from "@/lib/queryKeys"

export default function useUpdateProfile() {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const { mutate: updateUserProfile, isPending: isUpdating } = useMutation({
    mutationFn: (updateData) => updateProfile(updateData, currentUser?.id),
    onSuccess: (updatedUser) => {
      toast.success("Profile updated successfully")
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(currentUser?.id) })
      queryClient.setQueryData(queryKeys.currentUser, updatedUser)
    },
    onError: (err) => toast.error(err.message)
  })

  return { updateUserProfile, isUpdating }
}