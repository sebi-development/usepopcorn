import { useMemo } from "react"
import { HiFire } from "react-icons/hi2"
import Tooltip from "@/components/ui/Tooltip"
import SkeletonBox from "@/components/ui/SkeletonBox"
import FeatureCard from "@/features/browse/components/cards/FeatureCard"
import { bucketFor } from "@/utils/heatmapBuckets"
import { countStreak, getCountedWeeks } from "@/features/profile/hooks/useProfileStreak"

const THEME = { gradient: 'linear-gradient(135deg, #fab005 0%, #f76707 100%)', Icon: HiFire, iconClass: 'text-orange-500', rgb: '247, 103, 7' }

function formatWeekLabel(weekStart) {
  return new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function StreakCard({ data, extendedStreak, isSaturated, isLoading, isLoadingExtended, isError }) {
  const { fastStreak, recentWeeks, maxCount } = useMemo(() => {
    if (!data?.length) return { fastStreak: 0, recentWeeks: [], maxCount: 0 }
    const countedWeeks = getCountedWeeks(data)
    const streak = countStreak(countedWeeks)
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

  if (isError) return null

  return (
    <FeatureCard
      theme={THEME}
      isLoading={isLoading}
      label="Weekly Streak"
      // Streak → stats; no streak yet → go rate something
      to={displayStreak > 0 ? '/profile/stats' : '/browse?type=movies&category=trending'}
      ariaLabel={displayStreak > 0 ? 'View your statistics' : 'Start rating'}
      hero={
        isWaitingOnExtended ? (
          <SkeletonBox className="w-10 sm:w-16 h-8 sm:h-12 rounded-md" />
        ) : displayStreak > 0 ? (
          <span className="text-4xl sm:text-6xl font-black text-white leading-none drop-shadow-md">{displayStreak}</span>
        ) : null
      }
    >
      {recentWeeks.length > 0 && (
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
    </FeatureCard>
  )
}