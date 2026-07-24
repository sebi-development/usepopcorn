import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import supabase from "../../../lib/supabase"

export default function useFeedRealtime(followingIds) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!followingIds?.length) return

    // subscription
    const channel = supabase.channel('feed-realtime').on(
      'postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'ratings',
      filter: `user_id=in.(${followingIds.join(',')})`
    },
    () => {
      queryClient.invalidateQueries({queryKey: ['feed']})
    }
    ).subscribe()
    

    return () => {
      // cleanup will go here
      supabase.removeChannel(channel)
    }
  }, [followingIds])
}