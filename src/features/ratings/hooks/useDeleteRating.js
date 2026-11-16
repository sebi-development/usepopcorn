import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteRating } from "@/services/ratings"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { patchMediaState } from "@/features/interactions/hooks/useMediaState"
import invalidateRatingQueries from "@/features/ratings/hooks/invalidateRatingQueries"
import queryKeys from "@/lib/queryKeys"
import { titleKey } from "@/utils/tmdbItem"
import toast from "react-hot-toast"

export default function useDeleteRating() {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ tmdbId, type }) => deleteRating(tmdbId, type, currentUser?.id),
    onMutate: async ({ tmdbId, type }) => {
      const queryKey = queryKeys.mediaState(currentUser?.id)
      await queryClient.cancelQueries({ queryKey })
      const previousState = queryClient.getQueryData(queryKey)
      patchMediaState(queryClient, currentUser?.id, (old) => {
        const ratings = { ...old.ratings }
        delete ratings[titleKey(type, tmdbId)]
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
    onSettled: () => invalidateRatingQueries(queryClient, currentUser?.id),
  })

  return { mutate, isPending, error }
}
