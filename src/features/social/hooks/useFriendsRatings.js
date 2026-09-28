// src/features/social/hooks/useFriendsRatings.js
import { getFriendsRatings } from "@/services/follows"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import usePagedList from "@/hooks/usePagedList"
import { fromCursorRpc } from "@/utils/pagination"

const PAGE_SIZE = 12
// Friends' rows carry the id as `rating_id`, not `id`
const cursorOf = (row) => ({ created_at: row.created_at, id: row.rating_id })

// No auto-loading: the list lives inside a tab, so more friends are fetched
// only when the user presses "Load more".
export default function useFriendsRatings(tmdb_id) {
  const currentUser = useCurrentUser()
  const userId = currentUser?.id

  return usePagedList({
    queryKey: ['userFriendsRating', tmdb_id, userId],
    fetchPage: fromCursorRpc(
      ({ limit, cursor }) => getFriendsRatings(userId, tmdb_id, { limit, cursor }),
      PAGE_SIZE,
      cursorOf
    ),
    initialPageParam: null,
    autoPages: 0,
    enabled: !!userId && !!tmdb_id,
  })
}
