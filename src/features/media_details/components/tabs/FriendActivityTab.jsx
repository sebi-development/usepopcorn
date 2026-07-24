import FriendActivityTabSkeleton from "../../../../components/skeletons/FriendActivityTabSkeleton"
import useFriendsRatings from "../../../social/hooks/useFriendsRatings"
import FriendActivityItem from "../FriendActivityItem"

export default function FriendActivityTab({ tmdbId }) {
  const { data: friends, isLoading, isError } = useFriendsRatings(tmdbId)


  if (isLoading) {
    return <FriendActivityTabSkeleton />
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-sm text-red-400">
        Failed to load activity. Please try again.
      </div>
    )
  }

  // 3. THEN check for empty data.
  if (!friends || friends.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-text-muted">
        None of your friends have rated this yet.
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted bg-surface-900 px-2.5 py-1 rounded-full border border-white/5 shadow-sm">
          {friends.length} Friend{friends.length > 1 ? 's' : ''} rated this
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {friends.map(friend => (
          <FriendActivityItem key={friend.rating_id} friend={friend} />
        ))}
      </div>
    </div>
  )
}