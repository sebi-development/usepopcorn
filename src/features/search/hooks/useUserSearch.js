import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { searchUsers } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import useDebounce from "@/hooks/useDebounce"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

export default function useUserSearch(searchQuery) {
  const currentUser = useCurrentUser()
  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data, isFetching, isError } = useQuery({
    queryKey: queryKeys.search.users(debouncedSearch),
    queryFn: () => searchUsers(debouncedSearch, currentUser?.id),
    enabled: debouncedSearch.length >= 2,
    // Keep the last results on screen while the next term loads, instead of flashing empty
    placeholderData: keepPreviousData,
    // One entry per typed term: nothing to reuse once the text changes
    ...CACHE.ephemeral,
  })

  return { data, isFetching, isError }
}