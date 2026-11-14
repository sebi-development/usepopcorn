import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import queryKeys from "@/lib/queryKeys"
import { openChannel } from "@/services/realtime"

// Refreshes a title's average while anyone rates it
export default function useAverageRatingRealtime(tmdbId) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!tmdbId) return

    return openChannel(`average-rating-${tmdbId}`, (channel) => channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'ratings',
      filter: `tmdb_id=eq.${tmdbId}`,
    }, () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ratings.average(tmdbId) })
    }))
  }, [tmdbId, queryClient])
}
