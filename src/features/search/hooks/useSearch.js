import { useQuery } from "@tanstack/react-query"
import { searchContent, searchPeople } from "@/services/tmdb";
import { toMediaItem } from "@/utils/tmdbItem";
import { toPersonItem } from "@/utils/tmdbPerson";
import queryKeys from "@/lib/queryKeys";
import { CACHE } from "@/lib/queryClient";

// `filter` is 'movie', 'tv' or 'person' (no year for people); `query` arrives debounced.
// Returned as-is: TanStack Query re-renders each caller only for the fields it reads.
export default function useSearch(query, filter, year) {
  const isPeople = filter === 'person'

  return useQuery({
    queryKey: isPeople ? queryKeys.search.people(query) : queryKeys.search.media(filter, query, year),
    queryFn: async () => {
      const response = isPeople ? await searchPeople(query) : await searchContent(query, filter, year)
      return { results: (response.results ?? []).map(isPeople ? toPersonItem : toMediaItem) }
    },
    enabled: query.length > 0,
    // One entry per typed term: nothing to reuse once the text changes
    ...CACHE.ephemeral,
    // Keep the last results while typing, not across a tab switch, where they'd render as the new type
    placeholderData: (previous, previousQuery) => (previousQuery?.queryKey[1] === filter ? previous : undefined),
  })
}
