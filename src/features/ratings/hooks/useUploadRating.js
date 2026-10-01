import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadRating } from "@/services/ratings"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { mediaStateKey, patchMediaState } from "@/features/interactions/hooks/useMediaState"
import toast from "react-hot-toast"

export default function useUploadRating() {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data) => uploadRating(data, currentUser?.id),
    onMutate: async (data) => {
      const queryKey = mediaStateKey(currentUser?.id)
      await queryClient.cancelQueries({ queryKey })
      const previousState = queryClient.getQueryData(queryKey)
      patchMediaState(queryClient, currentUser?.id, (old) => ({
        ...old,
        ratings: { ...old.ratings, [data.tmdb_id]: data.score },
      }))
      return { previousState, queryKey }
    },
    onSuccess: () => {
      toast.success('Rating added successfully')
    },
    onError: (err, variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData(context.queryKey, context.previousState)
      }
      toast.error(`Error adding rating (${err.message})`)
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