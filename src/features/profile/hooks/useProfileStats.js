import { useQuery } from "@tanstack/react-query"
import { getUserProfileData } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

export default function useProfileStats(userId) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.profileStats(id),
    queryFn: () => getUserProfileData(id),
    enabled: !!id,
    ...CACHE.aggregate,
  })

  return { data, isLoading, isError }
}