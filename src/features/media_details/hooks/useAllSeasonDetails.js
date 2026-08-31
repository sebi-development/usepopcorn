import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getSeasonDetails } from "../../../services/tmdb";

/**
 * Fetches all season details in parallel when enabled.
 * Uses the same queryKey shape as useSeasonDetails so that individual
 * SeasonEpisodes components read from the already-populated cache
 * without triggering additional network requests.
 */
export default function useAllSeasonDetails(tvId, seasons, enabled = false) {
  const filteredSeasons = useMemo(
    () => seasons?.filter(s => s.season_number > 0) ?? [],
    [seasons]
  );

  const queries = useQueries({
    queries: filteredSeasons.map((season) => ({
      queryKey: ['seasonDetails', tvId, season.season_number],
      queryFn: () => getSeasonDetails(tvId, season.season_number),
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60,
      enabled: enabled && !!tvId,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError) && !isLoading;

  return { queries, isLoading, isError };
}
