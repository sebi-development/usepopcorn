import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadAvatarImage } from "../../../services/files"
import { updateProfile } from "../../../services/profiles"
import useCurrentUser from "../../auth/hooks/useCurrentUser"
import toast from "react-hot-toast"

export default function useUpdateAvatar() {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ file, oldAvatarUrl }) => {
      const newAvatarUrl = await uploadAvatarImage(file, oldAvatarUrl, currentUser?.id)
      await updateProfile({ avatar_url: newAvatarUrl }, currentUser?.id)
    },
    onSuccess: () => {
      toast.success('Avatar added successfully')
      queryClient.invalidateQueries({ queryKey: ['profile', currentUser?.id] })
    },
    onError: (err) => toast.error(`Failed uploading avatar: ${err.message}`)
  })

  return { mutate, isPending }
}