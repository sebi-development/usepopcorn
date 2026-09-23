import { useMemo } from "react"
import CommunityCardSkeleton from "@/features/social/components/CommunityPageSkeleton"
import ActivityCard from "@/features/social/components/CommunityCard"
import useFeed from "@/features/social/hooks/useFeed"
import useFeedRealtime from "@/features/social/hooks/useFeedRealtime"
import UserSearchWidget from "@/features/social/components/UserSearchWidget"
import SuggestedUsersWidget from "@/features/social/components/SuggestedUsersWidget"
import useDelayedLoading from "@/hooks/useDelayedLoading"

export default function CommunityPage() {
  const { data: feed, isLoading } = useFeed()
  const showLoading = useDelayedLoading(isLoading)
  const followingIds = useMemo(() =>
    [...new Set(feed?.map(item => item.user_id) ?? [])]
    , [feed])

  useFeedRealtime(followingIds)

  return (
    <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 md:gap-10 py-6 md:py-10 pb-12">

      {/* PAGE HEADER */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-text tracking-tight sm:text-3xl">
          Community Activity
        </h1>
        <p className="text-xs sm:text-sm text-text-muted">
          Latest ratings from the people you follow.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

        {/* LEFT ZONE */}
        <section className="relative flex flex-col gap-6 overflow-hidden">

          {/* Background Line */}
          <div className="absolute top-10 bottom-10 left-[19px] w-[2px] bg-surface-100 rounded-full" />

          {/* Skeletons */}
          {showLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 relative">
              <div className="w-10 shrink-0 flex justify-center pt-9 relative z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-surface-100 ring-[6px] ring-surface-900" />
              </div>
              <div className="flex-1 min-w-0">
                <CommunityCardSkeleton />
              </div>
            </div>
          ))}

          {/* Empty state */}
          {!showLoading && feed?.length === 0 && (
            <p className="text-text-muted text-sm pl-2">
              You're not following anyone yet. Find friends to see their activity.
            </p>
          )}

          {/* Feed */}
          {!showLoading && feed?.map((feedItem) => (
            <div key={feedItem.id} className="flex gap-4 relative group">
              <div className="w-10 shrink-0 flex justify-center pt-9 relative z-10">
                <div className="sticky top-32 w-2.5 h-2.5 rounded-full bg-surface-100 ring-[6px] ring-surface-900" />
              </div>
              <div className="flex-1 min-w-0">
                <ActivityCard item={feedItem} />
              </div>
            </div>
          ))}
        </section>

        {/* RIGHT ZONE */}
        <aside className="hidden lg:flex flex-col gap-6 sticky top-24">

          <UserSearchWidget />
          <SuggestedUsersWidget />

        </aside>

      </div>
    </main>
  )
}