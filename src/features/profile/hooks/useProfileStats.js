import { useQuery } from "@tanstack/react-query"
import { getUserProfileData } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// Shared with the /browse route loader (Home's cards wait on it)
export const profileStatsQuery = (userId) => ({
  queryKey: queryKeys.profileStats(userId),
  queryFn: () => getUserProfileData(userId),
  ...CACHE.aggregate,
})

export default function useProfileStats(userId) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data, isLoading, isError } = useQuery({ ...profileStatsQuery(id), enabled: !!id })

  return { data, isLoading, isError }
}
