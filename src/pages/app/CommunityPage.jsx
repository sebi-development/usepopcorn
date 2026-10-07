import { useCallback, useRef } from "react"
import { HiArrowUp } from "react-icons/hi2"
import CommunityCardSkeleton from "@/features/social/components/CommunityPageSkeleton"
import ActivityCard from "@/features/social/components/CommunityCard"
import TimelineRow from "@/features/social/components/TimelineRow"
import useFeed from "@/features/social/hooks/useFeed"
import useFeedRealtime from "@/features/social/hooks/useFeedRealtime"
import useFollowingIds from "@/features/social/hooks/useFollowingIds"
import UserSearchWidget from "@/features/social/components/UserSearchWidget"
import SuggestedUsersWidget from "@/features/social/components/SuggestedUsersWidget"
import LoadMoreFooter from "@/components/ui/LoadMoreFooter"

export default function CommunityPage() {
  const { items: feed, isLoading, phase, pageCount, fetchMore, isFetchingNextPage } = useFeed()
  const { followingIds, isLoading: isLoadingFollowing } = useFollowingIds()

  const { newCount, showNew } = useFeedRealtime(feed)
  const sectionRef = useRef(null)

  const handleShowNew = useCallback(() => {
    showNew()
    const section = sectionRef.current
    if (section && section.getBoundingClientRect().top < 0) section.scrollIntoView({ behavior: "smooth" })
  }, [showNew])

  return (
    <main className="max-w-5xl w-full mx-auto sm:px-6 lg:px-8 py-6 md:py-10 pb-12">
      {/* DOM order is header, widgets, feed so mobile shows the widgets before the feed.
          On lg the widgets move to a right column spanning both rows. */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] lg:grid-rows-[auto_1fr] gap-x-8 gap-y-8 md:gap-y-10 items-start">

        <header className="flex flex-col gap-1 lg:col-start-1 lg:row-start-1">
          <h1 className="text-2xl font-black text-text tracking-tight sm:text-3xl">
            Friends Activity
          </h1>
          <p className="text-xs sm:text-sm text-text-muted">
            Latest ratings from the people you follow.
          </p>
        </header>

        <aside className="flex flex-col gap-6 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24">
          <UserSearchWidget />
          <SuggestedUsersWidget />
        </aside>

        {/* overflow-clip, not hidden: hidden makes the section a scroll container, and sticky
            children (the new-ratings pill, the timeline dots) would stick to it, not the viewport */}
        <section ref={sectionRef} className="relative flex flex-col gap-6 overflow-clip min-w-0 scroll-mt-28 lg:col-start-1 lg:row-start-2">

          {/* Always rendered with no height (-mb-6 cancels the gap), so the pill appearing never
              pushes the feed down */}
          <div aria-live="polite" className="sticky top-28 z-20 h-0 -mb-6 flex justify-center">
            {newCount > 0 && (
              <button
                type="button"
                onClick={handleShowNew}
                className="h-fit flex items-center gap-1.5 px-4 py-3 md:py-2 rounded-full bg-primary text-white text-sm font-medium shadow-lg hover:bg-primary-light cursor-pointer"
              >
                <HiArrowUp size={14} />
                {newCount} new rating{newCount > 1 ? "s" : ""}
              </button>
            )}
          </div>

          {/* Background Line */}
          <div className="absolute top-10 bottom-10 left-4.75 w-0.5 bg-surface-100 rounded-full" />

          {isLoading && (
            <div className="flex flex-col gap-6 delayed-reveal">
              {Array.from({ length: 3 }).map((_, i) => (
                <TimelineRow key={i}>
                  <CommunityCardSkeleton />
                </TimelineRow>
              ))}
            </div>
          )}

          {feed?.length === 0 && !isLoadingFollowing && (followingIds?.length === 0 || !followingIds) && (
            <p className="text-text-muted text-sm pl-2">
              You're not following anyone yet. Find friends to see their activity.
            </p>
          )}

          {feed?.length === 0 && followingIds?.length > 0 && (
            <p className="text-text-muted text-sm pl-2">
              Your friends haven't rated anything yet. Be the first to break the ice!
            </p>
          )}

          {feed?.map((feedItem) => (
            <TimelineRow key={feedItem.id} sticky>
              <ActivityCard item={feedItem} />
            </TimelineRow>
          ))}

          {feed && (
            <LoadMoreFooter
              phase={phase}
              pageCount={pageCount}
              onLoadMore={fetchMore}
              isFetching={isFetchingNextPage}
              cappedMessage={`Showing the latest ${feed.length} ratings. Visit a profile to see their full history.`}
            />
          )}
        </section>

      </div>
    </main>
  )
}
