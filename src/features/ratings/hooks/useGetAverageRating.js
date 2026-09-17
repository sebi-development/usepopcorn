import { useQuery } from "@tanstack/react-query";
import { getAverageRating } from "@/services/ratings";

export default function useGetAverageRating(tmdbId) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ratings', 'average', tmdbId],
    queryFn: () => getAverageRating(tmdbId),
    enabled: !!tmdbId,
  })

  return { data, isLoading, error }
}