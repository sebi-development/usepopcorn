import { memo } from "react"
import { Link } from "react-router"
import Avatar from "@/components/ui/Avatar"
import getScoreTier from "@/utils/scoreTier"
import { timeAgo } from "@/utils/timeAgo"

const FriendActivityItem = memo(function FriendActivityItem({ friend }) {
  const percentage = Math.round((friend.score / 10) * 100)
  const { icon } = getScoreTier(percentage)

  return (
    <div className="flex items-center p-5 bg-surface-500 border border-surface-100 rounded-card hover:border-surface-300 transition-colors">

      <Link
        to={`/profile/${friend.user_id}`}
        className="flex items-center gap-2.5 min-w-[min(7.5rem,40%)] group cursor-pointer"
      >
        <Avatar
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

      <div className="w-px h-10 bg-white/5 shrink-0 mx-3.5 rounded-full" />

      {/* A floor, so a long username shrinks the link instead of pushing the score off-screen */}
      <div className="flex-1 flex items-center gap-2.5 min-w-24">
        {/* Same height as the avatar; contain keeps each tier's own aspect ratio */}
        <div className="flex h-10 w-8.5 shrink-0 items-center justify-center">
          <img
            src={icon.src}
            width={icon.w}
            height={icon.h}
            alt={icon.label}
            decoding="async"
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="self-end text-lg font-semibold text-primary-lighter leading-none tracking-tight">
            {percentage}%
          </span>

          <div className="relative w-full h-2 bg-white/10 rounded-full">
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
    </div>
  )
})

export default FriendActivityItem
