import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteRating } from "../../../services/ratings"
import useCurrentUser from "../../auth/hooks/useCurrentUser"
import toast from "react-hot-toast"

export default function useDeleteRating() {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const { mutate, isPending, error } = useMutation({
    mutationFn: (tmdb_id) => deleteRating(tmdb_id, currentUser?.id),
    onMutate: async (tmdb_id) => {
      const queryKey = ['ratings', 'movie', tmdb_id, currentUser?.id]
      await queryClient.cancelQueries({ queryKey })
      const previousRating = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, null)
      return { previousRating, queryKey }
    },
    onSuccess: () => {
      toast.success('Rating deleted successfully')
    },
    onError: (err, variables, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousRating)
      }
      toast.error(`Error deleting rating (${err.message})`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] })
      queryClient.invalidateQueries({ queryKey: ['profileStats', currentUser?.id] })
      queryClient.invalidateQueries({ queryKey: ['profileActivity', currentUser?.id, new Date().getFullYear()] })
    }
  })

  return { mutate, isPending, error }
}