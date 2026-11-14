import { useQueries } from "@tanstack/react-query";
import { seasonQuery } from "@/features/media_details/hooks/useSeasonDetails";

// Fetches every season in parallel once enabled, into the entries useSeasonDetails reads,
// so opening a season in the tab is a cache hit
export default function useAllSeasonDetails(tvId, seasons = [], enabled = false) {
  const queries = useQueries({
    queries: seasons.map((season) => ({
      ...seasonQuery(tvId, season.season_number),
      enabled: enabled && !!tvId,
    })),
  });

  return { isLoading: queries.some((q) => q.isLoading) };
}
