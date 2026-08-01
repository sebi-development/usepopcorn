import { useQuery } from "@tanstack/react-query"
import { getFeed } from "../../../services/follows"
import useCurrentUser from "../../auth/hooks/useCurrentUser"

export default function useFeed() {
  const currentUser = useCurrentUser()

  const { data, isLoading } = useQuery({
    queryKey: ['feed', currentUser?.id],
    queryFn: () => getFeed(currentUser?.id),
    enabled: !!currentUser?.id,
  })

  return { data, isLoading }
}