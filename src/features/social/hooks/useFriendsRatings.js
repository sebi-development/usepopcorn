// src/features/social/hooks/useFriendsRatings.js
import { useQuery } from "@tanstack/react-query"
import { getFriendsRatings } from "@/services/follows"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"

export default function useFriendsRatings(tmdb_id) {
  const currentUser = useCurrentUser()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['userFriendsRating', tmdb_id, currentUser?.id], 
    queryFn: () => getFriendsRatings(currentUser?.id, tmdb_id),
    enabled: !!currentUser?.id && !!tmdb_id
  })

  return { data, isLoading, isError }
}