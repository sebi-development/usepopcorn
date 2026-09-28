import AlertBanner from "@/components/ui/AlertBanner"
import FriendActivityTabSkeleton from "@/features/media_details/components/FriendActivityTabSkeleton"
import useDelayedLoading from "@/hooks/useDelayedLoading"
import useFriendsRatings from "@/features/social/hooks/useFriendsRatings"
import FriendActivityItem from "@/features/media_details/components/FriendActivityItem"
import LoadMoreFooter from "@/components/ui/LoadMoreFooter"

export default function FriendActivityTab({ tmdbId }) {
  const {
    items: friends, total, isLoading, isError, phase, pageCount, fetchMore, isFetchingNextPage,
  } = useFriendsRatings(tmdbId)
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

  // total comes from the RPC so the header counts every friend, not just loaded pages
  const friendCount = total ?? friends.length

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted bg-surface-900 px-2.5 py-1 rounded-full border border-white/5 shadow-sm">
          {friendCount} Friend{friendCount > 1 ? 's' : ''} rated this
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {friends.map(friend => (
          <FriendActivityItem key={friend.rating_id} friend={friend} />
        ))}
      </div>

      <LoadMoreFooter
        phase={phase}
        pageCount={pageCount}
        onLoadMore={fetchMore}
        isFetching={isFetchingNextPage}
        cappedMessage={`Showing ${friends.length} of ${friendCount} friends.`}
      />
    </div>
  )
}