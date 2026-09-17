import { useMemo } from "react"
import { HiFire } from "react-icons/hi2"
import Tooltip from "@/components/ui/Tooltip"
import SkeletonBox from "@/components/ui/SkeletonBox"
import FeatureCard from "@/components/ui/FeatureCard"

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

  if (isLoading) {
    return (
      <div className="aspect-2/3 w-full rounded-4xl bg-surface-900 border border-surface-100/10 p-2 animate-pulse flex flex-col">
        <div className="h-[70%] w-full rounded-3xl bg-surface-800" />
        <div className="flex-1 mt-4 mx-2">
          <div className="h-3 w-2/3 bg-surface-800 rounded mb-1.5" />
          <div className="h-6 w-1/2 bg-surface-800 rounded" />
        </div>
      </div>
    )
  }

  if (isError) return null

  return (
    <FeatureCard
      heroBackground="linear-gradient(135deg, #fab005 0%, #f76707 100%)"
      floatingIcon={<HiFire className="text-xl sm:text-3xl text-orange-500" />}
    >
      <h3 className="text-[10px] sm:text-sm font-bold text-text leading-tight mb-0.5 sm:mb-1">
        Weekly Streak
      </h3>
      
      {isWaitingOnExtended ? (
        <SkeletonBox className="w-10 sm:w-16 h-6 sm:h-8 rounded-md mb-auto" />
      ) : (
        <div className="flex items-baseline gap-0.5 sm:gap-1 mb-auto">
          {displayStreak > 0 ? (
            <span className="text-xl sm:text-3xl font-black text-text leading-none">{displayStreak}</span>
          ) : (
            <span className="text-[9px] sm:text-xs text-text-muted leading-tight line-clamp-2">Start rating.</span>
          )}
        </div>
      )}

      {recentWeeks.length > 0 && (
        <div className="pt-2 sm:pt-3 mt-1 sm:mt-2 border-t border-surface-100/10 flex justify-center">
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