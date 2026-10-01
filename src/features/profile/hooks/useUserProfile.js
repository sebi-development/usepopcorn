import { useQuery } from "@tanstack/react-query"
import { getProfile } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// Profile identity (avatar, username, country, join date). The only definition of the
// profile query: the navbar menu and the profile page both read it through this hook.
export default function useUserProfile(userId) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data: profileData, isLoading } = useQuery({
    queryKey: queryKeys.profile(id),
    queryFn: () => getProfile(id),
    enabled: !!id,
    ...CACHE.user,
  })

  return { profileData, isLoading }
}
