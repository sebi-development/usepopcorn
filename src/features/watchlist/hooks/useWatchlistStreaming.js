import { useQuery } from "@tanstack/react-query"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import useUserProfile from "@/features/profile/hooks/useUserProfile"
import { getStreamingServices } from "@/services/watchProviders"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// Which big streaming services carry the saved titles in the profile's country (US when none is set, as on a
// title's page): { services: { netflix: 'Netflix' }, titles: { 'movie:603': ['netflix'] } }. One Edge Function
// call, made only once `enabled` (the Streaming pill opened, or the URL already filters by it).
export default function useWatchlistStreaming(items, { enabled }) {
  const currentUser = useCurrentUser()
  const { profileData, isLoading } = useUserProfile()
  const region = isLoading ? null : (profileData?.country || 'US')

  return useQuery({
    queryKey: queryKeys.watchlistStreaming.region(currentUser?.id, region),
    queryFn: () => getStreamingServices(region, items.map((item) => [item.media_type, item.tmdb_id])),
    enabled: enabled && Boolean(region) && items.length > 0,
    ...CACHE.user,
  })
}
