import { useEffect, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import supabase from "@/lib/supabase"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import useFollowingIds from "@/features/social/hooks/useFollowingIds"

// Subscribes to ratings from everyone the user follows (not just authors already in the feed).
export default function useFeedRealtime() {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const { followingIds } = useFollowingIds()
  const followingKey = useMemo(() => {
    if (!followingIds?.length) return null;
    return [...followingIds].sort().join(',');
  }, [followingIds]);

  useEffect(() => {
    if (!followingKey || !currentUser?.id) return;

    const channelName = `feed-realtime-${currentUser.id}`;

    // subscription
    const channel = supabase.channel(channelName).on(
      'postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'ratings',
      filter: `user_id=in.(${followingKey})`
    },
    () => {
      queryClient.invalidateQueries({queryKey: ['feed', currentUser?.id]})
    }
    ).subscribe()
    

    return () => {
      // cleanup will go here
      supabase.removeChannel(channel)
    }
  }, [followingKey, currentUser?.id, queryClient])
}