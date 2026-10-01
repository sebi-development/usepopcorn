import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { seasonQuery } from "@/features/media_details/hooks/useSeasonDetails";

/**
 * Fetches all season details in parallel when enabled.
 * Uses the same query as useSeasonDetails so that individual
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
      ...seasonQuery(tvId, season.season_number),
      enabled: enabled && !!tvId,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError) && !isLoading;

  return { queries, isLoading, isError };
}
