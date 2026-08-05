import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteAvatarImage } from "../../../services/files"
import { updateProfile } from "../../../services/profiles"
import useCurrentUser from "../../auth/hooks/useCurrentUser"
import toast from "react-hot-toast"

export default function useRemoveAvatar() {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const { mutate, isPending } = useMutation({
    mutationFn: async (url) => {
      await deleteAvatarImage(url)
      await updateProfile({ avatar_url: null }, currentUser?.id)
    },
    onSuccess: () => {
      toast.success('Avatar deleted successfully')
      queryClient.setQueryData(['profile', currentUser?.id], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, avatar_url: null };
      });
    },
    onError: (err) => toast.error(`Failed deleting avatar: ${err.message}`)
  })

  return { mutate, isPending }
}