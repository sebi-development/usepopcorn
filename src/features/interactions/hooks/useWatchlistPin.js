import { useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { setWatchlistPin } from "@/services/interactions"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import queryKeys from "@/lib/queryKeys"
import toast from "react-hot-toast"

// Up next holds this many titles; the DB refuses another one too (limit_watchlist_pins)
export const PIN_LIMIT = 3
const FULL = `Up next holds ${PIN_LIMIT} titles. Unpin one first.`

const isTitle = (item, media) => item.tmdb_id === media.tmdb_id && item.media_type === media.media_type

// Pins a watchlist title to Up next or unpins it. The pin lives on the watchlist row, so the patched
// list is the only cache that changes, and the client's time is what the server stores: no refetch.
export default function useWatchlistPin() {
  const queryClient = useQueryClient()
  const userId = useCurrentUser()?.id
  const queryKey = queryKeys.interactions('watchlist', userId)

  const { mutate } = useMutation({
    mutationFn: ({ media, pinnedAt }) => setWatchlistPin(media, pinnedAt, userId),

    onMutate: async ({ media, pinnedAt }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old) => old?.map((item) => (isTitle(item, media) ? { ...item, pinned_at: pinnedAt } : item)))
      return { previous }
    },

    // No row: the title left the watchlist elsewhere, so the list is fetched to drop it
    onSuccess: (row) => {
      if (!row) queryClient.invalidateQueries({ queryKey })
    },

    onError: (err, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
      // The DB's limit message (a pin from a stale tab) reads as the client's own
      toast.error(err.message === FULL ? FULL : `Couldn't update Up next: ${err.message}`)
    },
  })

  // `media` is a list item or a card's { id, type }; `isPinned`: pinned now. A 4th pin is refused here,
  // from the cached list, without a request.
  return useCallback((media, isPinned) => {
    const title = { tmdb_id: media.tmdb_id ?? media.id, media_type: media.media_type ?? media.type }
    const pinned = queryClient.getQueryData(queryKeys.interactions('watchlist', userId))?.filter((item) => item.pinned_at).length ?? 0
    if (!isPinned && pinned >= PIN_LIMIT) {
      toast.error(FULL)
      return
    }
    mutate({ media: title, pinnedAt: isPinned ? null : new Date().toISOString() })
    toast.success(isPinned ? 'Unpinned from Up next' : 'Pinned to Up next')
  }, [queryClient, userId, mutate])
}
