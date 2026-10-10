import { useCallback, useMemo, useRef, useState } from "react"
import { HiArrowUp } from "react-icons/hi2"
import CommunityCardSkeleton from "@/features/social/components/CommunityPageSkeleton"
import ActivityCard from "@/features/social/components/CommunityCard"
import TimelineRow from "@/features/social/components/TimelineRow"
import useFeed from "@/features/social/hooks/useFeed"
import useFeedRealtime from "@/features/social/hooks/useFeedRealtime"
import useFollowingIds from "@/features/social/hooks/useFollowingIds"
import UserSearchWidget from "@/features/social/components/UserSearchWidget"
import SuggestedUsersWidget from "@/features/social/components/SuggestedUsersWidget"
import useFollowingProfiles from "@/features/social/hooks/useFollowingProfiles"
import { FEED_FILTERS, getFeedGenreOptions } from "@/features/social/constants/feedFilters"
import LoadMoreFooter from "@/components/ui/LoadMoreFooter"
import FilterBar from "@/components/filters/FilterBar"
import useUrlFilters from "@/hooks/useUrlFilters"

export default function CommunityPage() {
  const { filters, activeCount, setFilter, clearFilters } = useUrlFilters(FEED_FILTERS)
  const { items: feed, isLoading, phase, pageCount, fetchMore, isFetchingNextPage } = useFeed(filters)
  const { followingIds, isLoading: isLoadingFollowing } = useFollowingIds()

  // Friend names load the first time the Friend pill opens (or when the URL already names one)
  const [friendsRequested, setFriendsRequested] = useState(false)
  const handleFilterOpen = useCallback((key) => {
    if (key === "friend") setFriendsRequested(true)
  }, [])
  const { profiles } = useFollowingProfiles({ enabled: friendsRequested || !!filters.friend })

  // Runtime options: followed users for Friend (none followed → empty, so the pill is disabled
  // without a request), and the genre list of the chosen type
  const filterDefs = useMemo(() => {
    const friendOptions = followingIds?.length === 0
      ? []
      : profiles?.map((profile) => ({ value: profile.id, label: profile.username }))
    const genreOptions = getFeedGenreOptions(filters.type, filters.genre)
    return FEED_FILTERS.map((def) => {
      if (def.key === "friend") return { ...def, options: friendOptions }
      if (def.key === "genre") return { ...def, options: genreOptions }
      return def
    })
  }, [followingIds, profiles, filters.type, filters.genre])

  const { newCount, showNew } = useFeedRealtime(feed, filters)
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
          <FilterBar
            defs={filterDefs}
            filters={filters}
            onChange={setFilter}
            onClear={clearFilters}
            onOpen={handleFilterOpen}
            className="mt-4"
          />
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

          {feed?.length === 0 && activeCount > 0 && (
            <p className="text-text-muted text-sm pl-2">
              No ratings match these filters.
            </p>
          )}

          {feed?.length === 0 && activeCount === 0 && !isLoadingFollowing && (followingIds?.length === 0 || !followingIds) && (
            <p className="text-text-muted text-sm pl-2">
              You're not following anyone yet. Find friends to see their activity.
            </p>
          )}

          {feed?.length === 0 && activeCount === 0 && followingIds?.length > 0 && (
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
