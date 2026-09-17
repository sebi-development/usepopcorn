import { useMemo } from "react"
import { FiLoader } from "react-icons/fi"
import useSuggestedUsers from "@/features/social/hooks/useSuggestedUsers"
import UserResultItem from "@/features/social/components/UserResultltem"
import useDelayedLoading from "@/hooks/useDelayedLoading"

function getSuggestionSubtitle(user) {
  if (user.mutual_friend_count > 0) {
    const count = user.mutual_friend_count
    return `${count} mutual friend${count > 1 ? 's' : ''}`
  }
  if (user.recent_activity_count > 0) {
    return `${user.recent_activity_count} recent ratings`
  }
  return 'New to the community'
}

export default function SuggestedUsersWidget() {
  const { data: suggestions, isLoading } = useSuggestedUsers()
  const showLoading = useDelayedLoading(isLoading)

  // Precompute subtitles once per data change, not once per render.
  // Cheap either way at 4 items, but this is the correct habit for list-derived data.
  const suggestionsWithSubtitles = useMemo(() => {
    return suggestions?.map(user => ({
      ...user,
      subtitle: getSuggestionSubtitle(user)
    })) ?? []
  }, [suggestions])

  if (showLoading) {
    return (
      <div className="bg-surface-500 border border-surface-100 rounded-card p-5 flex justify-center py-10">
        <FiLoader className="animate-spin text-primary-light" size={20} />
      </div>
    )
  }

  // Nothing to suggest — hide the widget entirely rather than showing an empty shell
  if (suggestionsWithSubtitles.length === 0) return null

  return (
    <div className="bg-surface-500 border border-surface-100 rounded-card p-5 flex flex-col gap-2 transition-all duration-300 shadow-sm">
      <h3 className="font-bold text-sm text-text uppercase tracking-wider mb-2">
        Who to Follow
      </h3>

      <div className="flex flex-col">
        {suggestionsWithSubtitles.map((user) => (
          <UserResultItem key={user.id} user={user} subtitle={user.subtitle} />
        ))}
      </div>
    </div>
  )
}