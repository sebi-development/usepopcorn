import { useQuery } from "@tanstack/react-query"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { isFollowing } from "@/services/follows"

export default function useIsFollowing(followingUserId) {
  const currentUser = useCurrentUser()

  const { data, isLoading } = useQuery({
    queryKey: ['isFollowing', currentUser?.id, followingUserId],
    queryFn: () => isFollowing(currentUser?.id, followingUserId),
    enabled: !!currentUser?.id && !!followingUserId
  })

  return { data, isLoading }
}