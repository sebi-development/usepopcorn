import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import supabase from "@/lib/supabase"

export default function useAverageRatingRealtime(tmdbId) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!tmdbId) return

    const channel = supabase.channel(`average-rating-${tmdbId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ratings',
        filter: `tmdb_id=eq.${tmdbId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['ratings', 'average', tmdbId] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tmdbId])
}