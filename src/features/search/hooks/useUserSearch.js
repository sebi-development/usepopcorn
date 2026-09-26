import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { searchUsers } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import useDebounce from "@/hooks/useDebounce"

export default function useUserSearch(searchQuery) {
  const currentUser = useCurrentUser()
  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data, isFetching, isError } = useQuery({
    // The query key includes the search term, so React Query caches each search!
    queryKey: ['users', 'search', debouncedSearch],
    
    queryFn: () => searchUsers(debouncedSearch, currentUser?.id),
    enabled: debouncedSearch.length >= 2,
    // Keep the last results on screen while the next term loads, instead of flashing empty
    placeholderData: keepPreviousData,
    
    // Keep results fresh for a short time
    staleTime: 1000 * 60 * 2, 
  })

  return { data, isFetching, isError }
}