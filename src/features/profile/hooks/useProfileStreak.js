import { useQuery } from "@tanstack/react-query"
import { getProfileStreakData, getExtendedStreak } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// The last week in the RPC's window is always the current, in-progress one.
// It only counts once it already has activity; otherwise it's excluded, same
// as before it started.
export function getCountedWeeks(weeks) {
  if (!weeks?.length) return []
  const currentWeek = weeks[weeks.length - 1]
  return currentWeek.count > 0 ? weeks : weeks.slice(0, -1)
}

// Weeks in a row with a rating, back from the latest counted week
export const countStreak = (countedWeeks) => countedWeeks.length - 1 - countedWeeks.findLastIndex((week) => week.count === 0)

export default function useProfileStreak(userId) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const streakQuery = useQuery({
    queryKey: queryKeys.profileStreak(id),
    queryFn: () => getProfileStreakData(id),
    enabled: !!id,
    ...CACHE.aggregate,
  })

  const countedWeeks = getCountedWeeks(streakQuery.data)
  // Every week in the window counts, so the streak may run back further (the extended query)
  const isSaturated = countedWeeks.length > 0 && countStreak(countedWeeks) === countedWeeks.length

  const extendedQuery = useQuery({
    queryKey: queryKeys.extendedStreak(id),
    queryFn: () => getExtendedStreak(id),
    enabled: !!id && isSaturated,
    ...CACHE.aggregate,
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