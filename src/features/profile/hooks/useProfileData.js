import { useQuery } from "@tanstack/react-query"
import { getProfile } from "../../../services/profiles"
import { getUserRatings, getUserRatingsCount } from "../../../services/ratings"
import useCurrentUser from "../../auth/hooks/useCurrentUser"

export default function useProfileData(userId) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getProfile(id),
    enabled: !!id,
    staleTime: Infinity
  })

  const { data: recentRatings, isLoading: isLoadingRatings } = useQuery({
    queryKey: ['ratings', 'user', id],
    queryFn: () => getUserRatings(15, id),
    enabled: !!id,
    staleTime: Infinity
  })

  const { data: ratingsCount } = useQuery({
    queryKey: ['ratings', 'user', 'count', id],
    queryFn: () => getUserRatingsCount(id),
    enabled: !!id,
    staleTime: Infinity
  })

  return { profileData, recentRatings, ratingsCount, isLoadingProfile, isLoadingRatings }
}