import { useQuery } from "@tanstack/react-query"
import { getProfile } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"

// Lightweight hook for components that only need profile identity (avatar, username).
// Uses the same ['profile', id] cache key as useProfileData, so navigating to the
// profile page will find this data already cached — zero wasted fetches.
export default function useUserProfile(userId) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getProfile(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })

  return { profileData, isLoading }
}
