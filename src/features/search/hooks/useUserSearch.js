import { useQuery } from "@tanstack/react-query"
import { searchUsers } from "../../../services/profiles"
import useCurrentUser from "../../auth/hooks/useCurrentUser"

export default function useUserSearch(searchQuery) {
  const currentUser = useCurrentUser()

  const { data, isLoading, isError } = useQuery({
    // The query key includes the search term, so React Query caches each search!
    queryKey: ['users', 'search', searchQuery],
    
    queryFn: () => searchUsers(searchQuery, currentUser?.id),
    enabled: searchQuery.length >= 2,
    
    // Keep results fresh for a short time
    staleTime: 1000 * 60 * 2, 
  })

  return { data, isLoading, isError }
}