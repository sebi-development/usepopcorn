import { useQuery } from "@tanstack/react-query"
import queryKeys from "@/lib/queryKeys"

export default function useCurrentUser() {
  const { data } = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => null,
    staleTime: Infinity,
    gcTime: Infinity,
  })
  return data
}