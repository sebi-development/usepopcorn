import { useQuery } from "@tanstack/react-query";
import { getAverageRating } from "@/services/ratings";
import queryKeys from "@/lib/queryKeys";
import { CACHE } from "@/lib/queryClient";

// Key must stay queryKeys.ratings.average: useAverageRatingRealtime invalidates it.
export default function useGetAverageRating(tmdbId, type) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.ratings.average(type, tmdbId),
    queryFn: () => getAverageRating(tmdbId, type),
    enabled: !!tmdbId && !!type,
    ...CACHE.user,
  })

  return { data, isLoading, error }
}
