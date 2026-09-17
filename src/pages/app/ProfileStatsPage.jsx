import { useState } from "react"
import ProfileStats from "@/features/profile/components/ProfileStats"
import ActivityHeatmap from "@/features/profile/components/ActivityHeatmap"
import ArrowLink from "@/components/ui/ArrowLink"
import useProfileStats from "@/features/profile/hooks/useProfileStats"
import useProfileActivityData from "@/features/profile/hooks/useProfileActivityData"
import { useParams } from "react-router"

export default function ProfileStatsPage() {
  const { userId } = useParams()
  const [year, setYear] = useState(new Date().getFullYear())

  const { data: stats, isLoading: isStatsLoading, isError: isStatsError } = useProfileStats(userId)
  const { data: activity, isLoading: isActivityLoading, isError: isActivityError } = useProfileActivityData(userId, year)

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 w-full">

      <ArrowLink to="/profile" direction="left" className="text-text-muted hover:text-white mb-8">
        Back to Profile
      </ArrowLink>

      <div className="flex flex-col gap-8">
        <ProfileStats stats={stats} isLoading={isStatsLoading} isError={isStatsError} />
        <ActivityHeatmap
          data={activity}
          isLoading={isActivityLoading}
          isError={isActivityError}
          year={year}
          onYearChange={setYear}
        />
      </div>

    </main>
  )
}