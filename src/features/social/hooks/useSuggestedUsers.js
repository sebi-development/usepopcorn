import { useQuery } from "@tanstack/react-query"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { getSuggestedUsers } from "@/services/follows"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

export default function useSuggestedUsers() {
  const currentUser = useCurrentUser()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.suggestedUsers(currentUser?.id),
    queryFn: () => getSuggestedUsers(currentUser?.id),
    enabled: !!currentUser?.id,
    ...CACHE.aggregate,
  })

  return { data, isLoading }
}