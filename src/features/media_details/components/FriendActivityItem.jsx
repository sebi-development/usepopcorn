import { memo } from "react"
import { Link } from "react-router"
import Avatar from "@/components/ui/Avatar"
import { timeAgo } from "@/utils/timeAgo"

const FriendActivityItem = memo(function FriendActivityItem({ friend }) {
  const percentage = Math.round((friend.score / 10) * 100)

  return (
    <div className="flex items-center p-5 bg-surface-900/80 border border-white/5 rounded-2xl hover:bg-surface-900 transition-colors shadow-sm">

      <Link
        to={`/profile/${friend.user_id}`}
        className="flex items-center gap-2.5 shrink-0 min-w-[120px] group cursor-pointer"
      >
        <Avatar
          userId={friend.user_id}
          username={friend.username}
          avatarUrl={friend.avatar_url}
          sizeClass="w-10 h-10"
          iconSize={20}
        />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-text truncate group-hover:text-primary-light transition-colors">
            {friend.username}
          </span>
          <span className="text-[10px] font-medium text-text-muted opacity-70 truncate">
            {timeAgo(friend.created_at)}
          </span>
        </div>
      </Link>

      <div className="w-[1px] h-10 bg-white/5 shrink-0 mx-3.5 rounded-full" />

      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-end justify-between">
          <span className="text-[10px] font-medium text-text-muted opacity-70 uppercase tracking-wider">
            Score
          </span>
          <span className="text-lg font-semibold text-gradient-primary leading-none tracking-tight">
            {percentage}%
          </span>
        </div>

        <div className="relative w-full h-2.5 bg-surface-100/50 rounded-full mt-0.5">
          <div
            className="absolute top-0 left-0 h-full bg-primary-light rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${percentage}%`,
              boxShadow: '0 0 12px rgba(121, 80, 242, 0.7), 0 0 6px rgba(121, 80, 242, 0.4)'
            }}
          />
        </div>
      </div>
    </div>
  )
})

export default FriendActivityItem