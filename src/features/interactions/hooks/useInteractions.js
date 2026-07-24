import { useQuery } from "@tanstack/react-query"
import { getInteractions } from "../../../services/interactions"
import useCurrentUser from "../../auth/hooks/useCurrentUser"

export default function useInteractions(type, userId) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data, isLoading, error } = useQuery({
    queryKey: ['interactions', type, id],
    queryFn: () => getInteractions(type, id),
    enabled: !!id,
    staleTime: Infinity
  })
  return { data, isLoading, error }
}