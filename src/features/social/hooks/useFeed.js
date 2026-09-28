import { getFeed } from "@/services/follows"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import usePagedList from "@/hooks/usePagedList"
import { fromCursorRpc } from "@/utils/pagination"

// Key must stay ['feed', userId]: useFeedRealtime and useFollow invalidate it.
export default function useFeed() {
  const currentUser = useCurrentUser()
  const userId = currentUser?.id

  return usePagedList({
    queryKey: ['feed', userId],
    fetchPage: fromCursorRpc(({ limit, cursor }) => getFeed(userId, { limit, cursor })),
    initialPageParam: null,
    enabled: !!userId,
  })
}
