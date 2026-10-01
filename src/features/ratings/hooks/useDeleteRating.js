import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteRating } from "@/services/ratings"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { mediaStateKey, patchMediaState } from "@/features/interactions/hooks/useMediaState"
import toast from "react-hot-toast"

export default function useDeleteRating() {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const { mutate, isPending, error } = useMutation({
    mutationFn: (tmdb_id) => deleteRating(tmdb_id, currentUser?.id),
    onMutate: async (tmdb_id) => {
      const queryKey = mediaStateKey(currentUser?.id)
      await queryClient.cancelQueries({ queryKey })
      const previousState = queryClient.getQueryData(queryKey)
      patchMediaState(queryClient, currentUser?.id, (old) => {
        const ratings = { ...old.ratings }
        delete ratings[tmdb_id]
        return { ...old, ratings }
      })
      return { previousState, queryKey }
    },
    onSuccess: () => {
      toast.success('Rating deleted successfully')
    },
    onError: (err, variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData(context.queryKey, context.previousState)
      }
      toast.error(`Error deleting rating (${err.message})`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] })
      queryClient.invalidateQueries({ queryKey: mediaStateKey(currentUser?.id) })
      queryClient.invalidateQueries({ queryKey: ['profileStats', currentUser?.id] })
      queryClient.invalidateQueries({ queryKey: ['profileActivity', currentUser?.id, new Date().getFullYear()] })
      queryClient.invalidateQueries({ queryKey: ['profileStreak', currentUser?.id] })
      queryClient.invalidateQueries({ queryKey: ['extendedStreak', currentUser?.id] })
    }
  })

  return { mutate, isPending, error }
}