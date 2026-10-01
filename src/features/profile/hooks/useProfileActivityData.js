import { useQuery } from "@tanstack/react-query"
import { getUserActivity } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

export default function useProfileActivityData(userId, year) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.profileActivity.byYear(id, year),
    queryFn: () => getUserActivity(id, year),
    enabled: !!id,
    ...CACHE.aggregate,
  })

  return { data, isLoading, isError }
}