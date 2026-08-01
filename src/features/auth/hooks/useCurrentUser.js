import { useQuery } from "@tanstack/react-query"

export default function useCurrentUser() {
  const { data } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => null,
    staleTime: Infinity,
    gcTime: Infinity,
  })
  return data
}