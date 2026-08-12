import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteRating } from "../../../services/ratings"
import useCurrentUser from "../../auth/hooks/useCurrentUser"
import toast from "react-hot-toast"

export default function useDeleteRating() {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const { mutate, isPending, error } = useMutation({
    mutationFn: (tmdb_id) => deleteRating(tmdb_id, currentUser?.id),
    onSuccess: () => {
      toast.success('Rating deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['ratings'] })
      queryClient.invalidateQueries({ queryKey: ['profileStats', currentUser?.id] })
    },
    onError: (err) => {
      toast.error(`Error deleting rating (${err.message})`)
    }
  })

  return { mutate, isPending, error }
}