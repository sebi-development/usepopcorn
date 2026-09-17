import { useQuery } from "@tanstack/react-query"
import { getUserActivity } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"

export default function useProfileActivityData(userId, year) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data, isLoading, isError } = useQuery({
    queryKey: ['profileActivity', id, year],
    queryFn: () => getUserActivity(id, year),
    enabled: !!id,
    staleTime: Infinity,
  })

  return { data, isLoading, isError }
}