import { useMemo } from "react"
import { HiFire } from "react-icons/hi2"
import Tooltip from "@/components/ui/Tooltip"
import SkeletonBox from "@/components/ui/SkeletonBox"
import FeatureCard, { FeatureCardSkeleton } from "@/components/ui/FeatureCard"
import Chip from "@/components/ui/Chip"
import { bucketFor } from "@/utils/heatmapBuckets"

function calculateStreak(completedWeeks) {
  let streak = 0
  for (let i = completedWeeks.length - 1; i >= 0; i--) {
    if (completedWeeks[i].count > 0) streak++
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
    const completedWeeks = data.slice(0, -1)
    const recent = completedWeeks.slice(-6)
    return {
      fastStreak: calculateStreak(completedWeeks),
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
        ) : (
          <span className="text-[10px] sm:text-sm font-semibold text-white drop-shadow-md">Start rating</span>
        )
      }
    >
      <Chip size="sm" colorRgb="247, 103, 7" className="self-start max-w-full">
        <span className="truncate">Weekly Streak</span>
      </Chip>

      {recentWeeks.length > 0 && (
        <div className="mt-auto flex w-full justify-center gap-0.5 sm:gap-1">
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