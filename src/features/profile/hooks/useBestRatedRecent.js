import { useQuery } from "@tanstack/react-query"
import { getBestRatedIn } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"

export default function useBestRatedRecent(userId, days = 30) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data, isLoading, isError } = useQuery({
    queryKey: ['bestRatedRecent', id, days],
    queryFn: () => getBestRatedIn(id, days),
    enabled: !!id,
    staleTime: 1000 * 60 * 15,
  })

  return { data, isLoading, isError }
}