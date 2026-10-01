import { useQuery } from "@tanstack/react-query";
import { getAverageRating } from "@/services/ratings";
import queryKeys from "@/lib/queryKeys";
import { CACHE } from "@/lib/queryClient";

// Key must stay queryKeys.ratings.average: useAverageRatingRealtime invalidates it.
export default function useGetAverageRating(tmdbId) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.ratings.average(tmdbId),
    queryFn: () => getAverageRating(tmdbId),
    enabled: !!tmdbId,
    ...CACHE.user,
  })

  return { data, isLoading, error }
}
