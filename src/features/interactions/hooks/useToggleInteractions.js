import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleInteraction } from "@/services/interactions"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { patchMediaState } from "@/features/interactions/hooks/useMediaState"
import queryKeys from "@/lib/queryKeys"
import toast from "react-hot-toast"

// interaction type -> field of the media-state payload
const STATE_FIELD = { favorite: 'favorites', watchlist: 'watchlist' }
const LIST_NAMES = { favorite: 'Favorites', watchlist: 'Watchlist' }

export default function useToggleInteractions(type) {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const queryKey = queryKeys.interactions(type, currentUser?.id)
  const stateKey = queryKeys.mediaState(currentUser?.id)
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
      if (type === 'watchlist') queryClient.invalidateQueries({ queryKey: queryKeys.watchlistPick.all(currentUser?.id) })
    },
  })

  // `media` in any of the app's title shapes (list item, rating row, details); `isActive`: on the list now
  const toggle = (media, isActive) => {
    mutate({
      tmdb_id: media.id || media.tmdb_id,
      title: media.title || media.name,
      poster_path: media.poster_path,
      media_type: media.media_type || media.type || 'movie',
    })
    toast.success(`${isActive ? 'Removed from' : 'Added to'} ${LIST_NAMES[type]}`)
  }

  return { toggle, isPending }
}