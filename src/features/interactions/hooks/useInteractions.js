import { useQuery } from "@tanstack/react-query"
import { getInteractions } from "@/services/interactions"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"

export default function useInteractions(type, userId, { enabled: enabledOverride = true, staleTime = 1000 * 60 * 5 } = {}) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data, isLoading, error } = useQuery({
    queryKey: ['interactions', type, id],
    queryFn: () => getInteractions(type, id),
    enabled: !!id && enabledOverride,
    staleTime,
  })
  return { data, isLoading, error }
}