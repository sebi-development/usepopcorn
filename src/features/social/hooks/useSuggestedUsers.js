import { useQuery } from "@tanstack/react-query"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { getSuggestedUsers } from "@/services/follows"

export default function useSuggestedUsers() {
  const currentUser = useCurrentUser()

  const { data, isLoading } = useQuery({
    queryKey: ['suggested', currentUser?.id],
    queryFn: () => getSuggestedUsers(currentUser?.id),
    enabled: !!currentUser?.id,
    staleTime: Infinity
  })

  return { data, isLoading }
}