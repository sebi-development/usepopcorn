import { useQuery } from "@tanstack/react-query"
import { getRating } from "../../../services/ratings"
import useCurrentUser from "../../auth/hooks/useCurrentUser"

export default function useGetRating(tmdb_id) {
  const currentUser = useCurrentUser()

  const { data, isLoading, error } = useQuery({
    queryKey: ['ratings', 'movie', tmdb_id, currentUser?.id],
    queryFn: () => getRating(tmdb_id, currentUser?.id),
    enabled: !!tmdb_id && !!currentUser?.id,
  })

  return { data, isLoading, error }
}