import AlertBanner from "@/components/ui/AlertBanner"
import LoadMoreFooter from "@/components/ui/LoadMoreFooter"
import SkeletonBox from "@/components/ui/SkeletonBox"
import useFriendsRatings from "@/features/social/hooks/useFriendsRatings"
import FriendActivityItem, { FriendActivityItemSkeleton } from "@/features/media_details/components/tabs/FriendActivityTab/FriendActivityItem"

const GRID_CLASS = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
const SKELETON_ITEMS = [1, 2, 3]

// One placeholder per real element: the count chip, then the cards
function FriendActivitySkeleton() {
  return (
    <div className="flex flex-col gap-5 delayed-reveal">
      <SkeletonBox className="h-6.5 w-32 rounded-full" />
      <div className={GRID_CLASS}>
        {SKELETON_ITEMS.map((i) => <FriendActivityItemSkeleton key={i} />)}
      </div>
    </div>
  )
}

export default function FriendActivityTab({ tmdbId }) {
  const {
    items: friends, total, isLoading, isError, phase, pageCount, fetchMore, isFetchingNextPage,
  } = useFriendsRatings(tmdbId)

  if (isLoading) return <FriendActivitySkeleton />
  if (isError) return <AlertBanner variant="danger" message="Failed to load activity. Please try again." />
  if (!friends?.length) return <AlertBanner variant="info" message="None of your friends have rated this yet." />

  // total comes from the RPC so the header counts every friend, not just loaded pages
  const friendCount = total ?? friends.length

  return (
    <div className="flex flex-col gap-5">
      <span className="self-start text-xs font-medium text-text-muted bg-surface-900 px-2.5 py-1 rounded-full border border-white/5 shadow-sm">
        {friendCount} Friend{friendCount > 1 ? 's' : ''} rated this
      </span>

      <div className={GRID_CLASS}>
        {friends.map((friend) => (
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
