import ProfileStats from "../../features/profile/components/ProfileStats"
import { HiArrowLeft } from "react-icons/hi2"
import { Link } from "react-router"

const mockStats = {
  totalRated: 42,
  averageScore: 7.8,
  totalWatchHours: 115,
  topGenres: [{ name: 'Sci-Fi', count: 12 }, { name: 'Drama', count: 8 }, { name: 'Action', count: 5 }]
}

export default function ProfileStatsPage() {
  // const { stats, isLoading } = useProfileStats() // Coming soon

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 w-full">

      {/* Back Navigation */}
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-8 group"
      >
        <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        Back to Profile
      </Link>

      <ProfileStats stats={mockStats} isLoading={false} />

    </main>
  )
}