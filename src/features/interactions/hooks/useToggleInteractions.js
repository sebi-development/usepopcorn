import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addInteraction, removeInteraction } from "@/services/interactions"
import { getMediaSummary } from "@/services/tmdb"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { patchMediaState } from "@/features/interactions/hooks/useMediaState"
import queryKeys from "@/lib/queryKeys"
import { titleKey } from "@/utils/tmdbItem"
import toast from "react-hot-toast"

// interaction type -> field of the media-state payload
const STATE_FIELD = { favorite: 'favorites', watchlist: 'watchlist' }
const LIST_NAMES = { favorite: 'Favorites', watchlist: 'Watchlist' }

// What the watchlist stores besides the title (its filters read these), from a TMDB details payload
const toMetadata = (details, type) => ({
  genre_ids: details.genres?.map((genre) => genre.id) ?? [],
  release_date: details.release_date || details.first_air_date || null,
  runtime: (type === 'movie' && details.runtime) || null,
  seasons: (type === 'tv' && details.number_of_seasons) || null,
})

// Movie and TV ids overlap, so a list item is the title only when both match
const isTitle = (item, media) => item.tmdb_id === media.tmdb_id && item.media_type === media.media_type

// Adds the title to a list or takes it off, as the user asked (`adding`). The write leaves the server
// exactly as the optimistic patch guessed, so a success refetches neither the list nor the media state.
export default function useToggleInteractions(type) {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const queryKey = queryKeys.interactions(type, currentUser?.id)
  const stateKey = queryKeys.mediaState(currentUser?.id)
  const stateField = STATE_FIELD[type]

  const { mutate, isPending } = useMutation({
    // A watchlist add stores the title's metadata: from `details` when the caller has them (the Detail page),
    // else from TMDB. A failed request fails the add, so a stored row always has its metadata.
    mutationFn: async ({ media, details, adding }) => {
      if (!adding) return removeInteraction(type, media, currentUser?.id)
      if (type !== 'watchlist') return addInteraction(type, media, currentUser?.id)
      const source = details ?? await getMediaSummary(media.tmdb_id, media.media_type)
      return addInteraction(type, { ...media, ...toMetadata(source, media.media_type) }, currentUser?.id)
    },

    onMutate: async ({ media, adding }) => {
      await Promise.all([queryClient.cancelQueries({ queryKey }), queryClient.cancelQueries({ queryKey: stateKey })])
      const previous = queryClient.getQueryData(queryKey)
      const previousState = queryClient.getQueryData(stateKey)

      // A list that was never fetched stays unfetched: a one-item list would pass for the whole one.
      // A new save goes first (the list is newest first) until the stored row replaces it.
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old
        const rest = old.filter((item) => !isTitle(item, media))
        return adding ? [{ ...media, created_at: new Date().toISOString() }, ...rest] : rest
      })
      const key = titleKey(media.media_type, media.tmdb_id)
      patchMediaState(queryClient, currentUser?.id, (old) => {
        const rest = old[stateField].filter((x) => x !== key)
        return { ...old, [stateField]: adding ? [...rest, key] : rest }
      })
      return { previous, previousState }
    },

    onSuccess: (row, { media, adding }) => {
      if (!adding) return
      // The stored row (with its metadata and created_at) replaces the optimistic one. No row: the title
      // was already on the list (another tab or device), so the list is fetched to show the stored one.
      if (row) queryClient.setQueryData(queryKey, (old) => old?.map((item) => (isTitle(item, media) ? row : item)))
      else queryClient.invalidateQueries({ queryKey })
    },

    onError: (err, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
      if (context?.previousState) queryClient.setQueryData(stateKey, context.previousState)
      toast.error(`Something went wrong: ${err.message}`)
    },

    onSettled: (_row, _error, { adding }) => {
      if (type !== 'watchlist') return
      // Today's pick is ranked among the whole watchlist, so any change can move it
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlistPick.all(currentUser?.id) })
      // A new title isn't in the Streaming filter's answer yet (a removed one simply drops out of the list)
      if (adding) queryClient.invalidateQueries({ queryKey: queryKeys.watchlistStreaming.all(currentUser?.id) })
    },
  })

  // `media` in any of the app's title shapes (list item, rating row, details); `isActive`: on the list now
  const toggle = (media, isActive) => {
    mutate({
      media: {
        tmdb_id: media.id || media.tmdb_id,
        title: media.title || media.name,
        poster_path: media.poster_path,
        media_type: media.media_type || media.type || 'movie',
      },
      adding: !isActive,
      details: Array.isArray(media.genres) ? media : undefined,
    })
    toast.success(`${isActive ? 'Removed from' : 'Added to'} ${LIST_NAMES[type]}`)
  }

  return { toggle, isPending }
}
