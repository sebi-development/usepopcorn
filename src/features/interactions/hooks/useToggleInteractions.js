import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleInteraction } from "@/services/interactions"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { mediaStateKey, patchMediaState } from "@/features/interactions/hooks/useMediaState"
import toast from "react-hot-toast"

// interaction type -> field of the media-state payload
const STATE_FIELD = { favorite: 'favorites', watchlist: 'watchlist' }

export default function useToggleInteractions(type) {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const queryKey = ['interactions', type, currentUser?.id]
  const stateKey = mediaStateKey(currentUser?.id)
  const stateField = STATE_FIELD[type]

  const { mutate, isPending } = useMutation({
     mutationFn: (mediaData) => toggleInteraction(type, mediaData, currentUser?.id),

    onMutate: async (mediaData) => {
      await Promise.all([queryClient.cancelQueries({ queryKey }), queryClient.cancelQueries({ queryKey: stateKey })])
      const previous = queryClient.getQueryData(queryKey)
      const previousState = queryClient.getQueryData(stateKey)
      queryClient.setQueryData(queryKey, (old) => {
        const normalizedId = mediaData.tmdb_id || mediaData.id
        if (!old) {
          return [{ ...mediaData, tmdb_id: normalizedId, id: 'temp-id', interaction_type: type }]
        }
        const exists = old.some(item => item.tmdb_id === normalizedId)
        return exists
          ? old.filter(item => item.tmdb_id !== normalizedId)
          : [...old, { ...mediaData, tmdb_id: normalizedId, id: 'temp-id', interaction_type: type }]
      })
      if (stateField) {
        const id = Number(mediaData.tmdb_id || mediaData.id)
        patchMediaState(queryClient, currentUser?.id, (old) => ({
          ...old,
          [stateField]: old[stateField].includes(id) ? old[stateField].filter(x => x !== id) : [...old[stateField], id],
        }))
      }
      return { previous, previousState }
    },

    onError: (err, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
      if (context?.previousState) queryClient.setQueryData(stateKey, context.previousState)
      toast.error(`Something went wrong: ${err.message}`)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: stateKey })
    },
  })

  return { mutate, isPending }
}