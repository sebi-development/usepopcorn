import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { searchContent } from "@/services/tmdb";
import useDebounce from "@/hooks/useDebounce";
import { toMediaItem } from "@/utils/tmdbItem";
import queryKeys from "@/lib/queryKeys";
import { CACHE } from "@/lib/queryClient";

export default function useSearch(query, filter) {
  const debouncedQuery = useDebounce(query, 200)

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: queryKeys.search.media(filter, debouncedQuery),
    queryFn: async () => {
      const response = await searchContent(debouncedQuery, filter)
      return { results: (response.results ?? []).map(toMediaItem) }
    },
    enabled: debouncedQuery.length > 0,
    // One entry per typed term: nothing to reuse once the text changes
    ...CACHE.ephemeral,
    placeholderData: keepPreviousData
  })

  return { data, isLoading, isFetching, error }
}
