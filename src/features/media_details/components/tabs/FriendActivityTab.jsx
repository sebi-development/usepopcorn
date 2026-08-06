import AlertBanner from "../../../../components/AlertBanner"
import FriendActivityTabSkeleton from "../../../../components/skeletons/FriendActivityTabSkeleton"
import useDelayedLoading from "../../../../hooks/useDelayedLoading"
import useFriendsRatings from "../../../social/hooks/useFriendsRatings"
import FriendActivityItem from "../FriendActivityItem"

export default function FriendActivityTab({ tmdbId }) {
  const { data: friends, isLoading, isError } = useFriendsRatings(tmdbId)
  const showLoading = useDelayedLoading(isLoading)

  if (showLoading) {
    return <FriendActivityTabSkeleton />
  }

  if (isError) {
    return (
      <AlertBanner variant="danger" message="Failed to load activity. Please try again." />
    )
  }
  
  if (!friends || friends.length === 0) {
    return (
      <AlertBanner variant="info" message="None of your friends have rated this yet." />
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