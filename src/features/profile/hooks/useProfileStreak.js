import { useQuery } from "@tanstack/react-query"
import { getProfileStreakData, getExtendedStreak } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"

export default function useProfileStreak(userId) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const streakQuery = useQuery({
    queryKey: ['profileStreak', id],
    queryFn: () => getProfileStreakData(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 15,
  })

  const completedWeeks = streakQuery.data?.slice(0, -1) ?? []
  const isSaturated = completedWeeks.length > 0 &&
    completedWeeks.every(week => week.count > 0)

  const extendedQuery = useQuery({
    queryKey: ['extendedStreak', id],
    queryFn: () => getExtendedStreak(id),
    enabled: !!id && isSaturated,
    staleTime: 1000 * 60 * 15,
  })

  return {
    data: streakQuery.data,
    extendedStreak: extendedQuery.data,
    isSaturated,
    isLoadingExtended: extendedQuery.isLoading,
    isLoading: streakQuery.isLoading,
    isError: streakQuery.isError,
  }
}