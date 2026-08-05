import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { searchContent } from "../../../services/tmdb";
import useDebounce from "../../../hooks/useDebounce";

export default function useSearch(query, filter) {
  const debouncedQuery = useDebounce(query, 200)

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', filter, debouncedQuery],
    queryFn: () => searchContent(debouncedQuery, filter),
    enabled: debouncedQuery.length > 0,
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData
  })

  return { data, isLoading, error }
}