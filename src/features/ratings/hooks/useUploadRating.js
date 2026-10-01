import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadRating } from "@/services/ratings"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { patchMediaState } from "@/features/interactions/hooks/useMediaState"
import invalidateRatingQueries from "@/features/ratings/hooks/invalidateRatingQueries"
import queryKeys from "@/lib/queryKeys"
import toast from "react-hot-toast"

export default function useUploadRating() {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data) => uploadRating(data, currentUser?.id),
    onMutate: async (data) => {
      const queryKey = queryKeys.mediaState(currentUser?.id)
      await queryClient.cancelQueries({ queryKey })
      const previousState = queryClient.getQueryData(queryKey)
      patchMediaState(queryClient, currentUser?.id, (old) => ({
        ...old,
        ratings: { ...old.ratings, [data.tmdb_id]: data.score },
      }))
      return { previousState, queryKey }
    },
    onError: (err, variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData(context.queryKey, context.previousState)
      }
      toast.error(`Error adding rating (${err.message})`)
    },
    onSettled: () => invalidateRatingQueries(queryClient, currentUser?.id),
  })

  return { mutate, isPending, error }
}
