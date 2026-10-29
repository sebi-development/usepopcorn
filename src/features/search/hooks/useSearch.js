import { useQuery } from "@tanstack/react-query"
import { searchContent, searchPeople } from "@/services/tmdb";
import useDebounce from "@/hooks/useDebounce";
import { toMediaItem } from "@/utils/tmdbItem";
import { toPersonItem } from "@/utils/tmdbPerson";
import queryKeys from "@/lib/queryKeys";
import { CACHE } from "@/lib/queryClient";

// `filter` is 'movie', 'tv' or 'person'; people take no year
export default function useSearch(query, filter, year) {
  const debouncedQuery = useDebounce(query, 200)
  const isPeople = filter === 'person'

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: isPeople ? queryKeys.search.people(debouncedQuery) : queryKeys.search.media(filter, debouncedQuery, year),
    queryFn: async () => {
      const response = isPeople ? await searchPeople(debouncedQuery) : await searchContent(debouncedQuery, filter, year)
      return { results: (response.results ?? []).map(isPeople ? toPersonItem : toMediaItem) }
    },
    enabled: debouncedQuery.length > 0,
    // One entry per typed term: nothing to reuse once the text changes
    ...CACHE.ephemeral,
    // Keep the last results while typing, not across a tab switch, where they'd render as the new type
    placeholderData: (previous, previousQuery) => (previousQuery?.queryKey[1] === filter ? previous : undefined),
  })

  return { data, isLoading, isFetching, error }
}
