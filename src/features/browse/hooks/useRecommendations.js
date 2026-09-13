import { useQuery } from "@tanstack/react-query"
import { getRecommendationSeed } from "../../../services/ratings"
import { getRecommendations } from "../../../services/tmdb"
import useCurrentUser from "../../auth/hooks/useCurrentUser"

export default function useRecommendations() {
  const currentUser = useCurrentUser()

  const seedQuery = useQuery({
    queryKey: ['recommendationSeed', currentUser?.id],
    queryFn: () => getRecommendationSeed(currentUser?.id),
    enabled: !!currentUser?.id,
    staleTime: 1000 * 60 * 15,
  })

  const recsQuery = useQuery({
    queryKey: ['recommendations', seedQuery.data?.tmdb_id, seedQuery.data?.type],
    queryFn: () => getRecommendations(seedQuery.data.tmdb_id, seedQuery.data.type),
    enabled: !!seedQuery.data?.tmdb_id,
    staleTime: 1000 * 60 * 15,
  })

  return {
    seedTitle: seedQuery.data,
    data: recsQuery.data?.results,
    isLoading: seedQuery.isLoading || recsQuery.isLoading,
    isError: seedQuery.isError || recsQuery.isError,
  }
}