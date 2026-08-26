import { useQuery } from "@tanstack/react-query"
import { getUserProfileData } from "../../../services/profiles"
import useCurrentUser from "../../auth/hooks/useCurrentUser"

export default function useProfileStats(userId) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data, isLoading, isError } = useQuery({
    queryKey: ['profileStats', id],
    queryFn: () => getUserProfileData(id),
    enabled: !!id,
    staleTime: Infinity,
  })

  return { data, isLoading, isError }
}