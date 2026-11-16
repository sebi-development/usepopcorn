import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import queryKeys from "@/lib/queryKeys"
import { openChannel } from "@/services/realtime"

// Refreshes a title's average while anyone rates it. Realtime filters on one column, so a rating of the
// other type with the same id refreshes it too: one extra small request, the shown average stays right.
export default function useAverageRatingRealtime(tmdbId, type) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!tmdbId) return

    return openChannel(`average-rating-${type}-${tmdbId}`, (channel) => channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'ratings',
      filter: `tmdb_id=eq.${tmdbId}`,
    }, () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ratings.average(type, tmdbId) })
    }))
  }, [tmdbId, type, queryClient])
}
