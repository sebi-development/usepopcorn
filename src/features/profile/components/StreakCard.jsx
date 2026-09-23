import { useMemo } from "react"
import { HiFire } from "react-icons/hi2"
import Tooltip from "@/components/ui/Tooltip"
import SkeletonBox from "@/components/ui/SkeletonBox"
import FeatureCard, { FeatureCardSkeleton } from "@/components/ui/FeatureCard"
import Chip from "@/components/ui/Chip"

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
  const { fastStreak, recentWeeks } = useMemo(() => {
    if (!data?.length) return { fastStreak: 0, recentWeeks: [] }
    const completedWeeks = data.slice(0, -1)
    return {
      fastStreak: calculateStreak(completedWeeks),
      recentWeeks: completedWeeks.slice(-6),
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
        <div className="mt-auto flex justify-center">
          <div className="flex gap-px sm:gap-0.5 items-center">
            {recentWeeks.map((week) => (
              <Tooltip
                key={week.weekStart}
                label={`Week of ${formatWeekLabel(week.weekStart)}: ${week.count} rating${week.count === 1 ? '' : 's'}`}
              >
                <span
                  className={`block w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-[1px] sm:rounded-sm ${
                    week.count > 0 ? 'bg-primary-light' : 'bg-surface-100/10'
                  }`}
                />
              </Tooltip>
            ))}
          </div>
        </div>
      )}
    </FeatureCard>
  )
}