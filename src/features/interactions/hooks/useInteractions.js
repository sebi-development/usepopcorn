import { useQuery } from "@tanstack/react-query"
import { getInteractions } from "@/services/interactions"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

export default function useInteractions(type, userId, { enabled: enabledOverride = true, staleTime = CACHE.user.staleTime } = {}) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.interactions(type, id),
    queryFn: () => getInteractions(type, id),
    enabled: !!id && enabledOverride,
    ...CACHE.user,
    staleTime,
  })
  return { data, isLoading, error }
}
