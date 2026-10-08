import { useMemo } from "react"
import { Link } from "react-router"
import { HiFire } from "react-icons/hi2"
import Tooltip from "@/components/ui/Tooltip"
import SkeletonBox from "@/components/ui/SkeletonBox"
import FeatureCard, { FeatureCardSkeleton } from "@/components/ui/FeatureCard"
import Chip from "@/components/ui/Chip"
import { bucketFor } from "@/utils/heatmapBuckets"
import { getCountedWeeks } from "@/features/profile/hooks/useProfileStreak"

function calculateStreak(countedWeeks) {
  let streak = 0
  for (let i = countedWeeks.length - 1; i >= 0; i--) {
    if (countedWeeks[i].count > 0) streak++
    else break
  }
  return streak
}

function formatWeekLabel(weekStart) {
  return new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function StreakCard({ data, extendedStreak, isSaturated, isLoading, isLoadingExtended, isError }) {
  const { fastStreak, recentWeeks, maxCount } = useMemo(() => {
    if (!data?.length) return { fastStreak: 0, recentWeeks: [], maxCount: 0 }
    const countedWeeks = getCountedWeeks(data)
    const streak = calculateStreak(countedWeeks)
    // No streak, no tiles. (slice(-0) is slice(0): it would return every week, all empty.)
    const recent = streak > 0 ? countedWeeks.slice(-Math.min(streak, 6)) : []
    return {
      fastStreak: streak,
      recentWeeks: recent,
      maxCount: Math.max(0, ...recent.map(w => w.count)),
    }
  }, [data])

  const isWaitingOnExtended = isSaturated && isLoadingExtended
  const displayStreak = isSaturated && extendedStreak != null ? extendedStreak : fastStreak

  if (isLoading) return <FeatureCardSkeleton />

  if (isError) return null

  return (
    <FeatureCard
      heroBackground="linear-gradient(135deg, #fab005 0%, #f76707 100%)"
      floatingIcon={<HiFire className="text-xl sm:text-3xl text-orange-500" />}
      heroContent={
        isWaitingOnExtended ? (
          <SkeletonBox className="w-10 sm:w-16 h-8 sm:h-12 rounded-md" />
        ) : displayStreak > 0 ? (
          <span className="text-4xl sm:text-6xl font-black text-white leading-none drop-shadow-md">{displayStreak}</span>
        ) : null
      }
    >
      <Chip size="sm" colorRgb="247, 103, 7" className="self-start max-w-full">
        <span className="truncate">Weekly Streak</span>
      </Chip>

      {recentWeeks.length > 0 && (
        // With a mouse the dots sit above the card link so their hover tooltips work; on
        // touch (no hover, 8px targets) they sit below it, so a tap anywhere opens the link
        <div className="relative z-30 pointer-coarse:z-10 mt-auto flex w-full justify-center gap-0.5 sm:gap-1">
          {recentWeeks.map((week) => (
            <Tooltip
              key={week.weekStart}
              label={`Week of ${formatWeekLabel(week.weekStart)}: ${week.count} rating${week.count === 1 ? '' : 's'}`}
            >
              <span className={`block w-2 h-2 sm:w-3 sm:h-3 rounded-sm ${bucketFor(week.count, maxCount)}`} />
            </Tooltip>
          ))}
        </div>
      )}

      {/* Stretched link over the whole card, same pattern as BestRatedCard. Streak → stats; no streak yet → go rate something. */}
      <Link
        to={displayStreak > 0 ? '/profile/stats' : '/browse?type=movies&category=trending'}
        aria-label={displayStreak > 0 ? 'View your statistics' : 'Start rating'}
        className="absolute inset-0 z-20 rounded-[1.75rem] sm:rounded-4xl"
      />
    </FeatureCard>
  )
}