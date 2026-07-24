import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadRating } from "../../../services/ratings"
import useCurrentUser from "../../auth/hooks/useCurrentUser"
import toast from "react-hot-toast"

export default function useUploadRating() {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data) => uploadRating(data, currentUser?.id),
    onSuccess: () => {
      toast.success('Rating added successfully')
      queryClient.invalidateQueries({ queryKey: ['ratings'] })
    },
    onError: (err) => {
      toast.error(`Error adding rating (${err.message})`)
    }
  })

  return { mutate, isPending, error }
}