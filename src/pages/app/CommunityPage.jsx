import CommunityCardSkeleton from "@/features/social/components/CommunityPageSkeleton"
import ActivityCard from "@/features/social/components/CommunityCard"
import TimelineRow from "@/features/social/components/TimelineRow"
import useFeed from "@/features/social/hooks/useFeed"
import useFeedRealtime from "@/features/social/hooks/useFeedRealtime"
import UserSearchWidget from "@/features/social/components/UserSearchWidget"
import SuggestedUsersWidget from "@/features/social/components/SuggestedUsersWidget"
import useDelayedLoading from "@/hooks/useDelayedLoading"

export default function CommunityPage() {
  const { data: feed, isLoading } = useFeed()
  const showLoading = useDelayedLoading(isLoading)

  useFeedRealtime()

  return (
    <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-12">
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

        <section className="relative flex flex-col gap-6 overflow-hidden min-w-0 lg:col-start-1 lg:row-start-2">

          {/* Background Line */}
          <div className="absolute top-10 bottom-10 left-[19px] w-[2px] bg-surface-100 rounded-full" />

          {showLoading && Array.from({ length: 3 }).map((_, i) => (
            <TimelineRow key={i}>
              <CommunityCardSkeleton />
            </TimelineRow>
          ))}

          {!showLoading && feed?.length === 0 && (
            <p className="text-text-muted text-sm pl-2">
              You're not following anyone yet. Find friends to see their activity.
            </p>
          )}

          {!showLoading && feed?.map((feedItem) => (
            <TimelineRow key={feedItem.id} sticky>
              <ActivityCard item={feedItem} />
            </TimelineRow>
          ))}
        </section>

      </div>
    </main>
  )
}
