import { memo } from "react"
import { Link } from "react-router"
import Avatar from "@/components/ui/Avatar"
import SkeletonBox from "@/components/ui/SkeletonBox"
import getScoreTier from "@/features/media_details/utils/scoreTier"
import { timeAgo } from "@/utils/timeAgo"

// Shared with the skeleton, so the card keeps its shape when the ratings land
const CARD_CLASS = "flex items-center p-5 bg-surface-500 border border-surface-100 rounded-card"
const USER_CLASS = "flex items-center gap-2.5 min-w-[min(7.5rem,40%)]"
// A floor, so a long username shrinks the link instead of pushing the score off-screen
const SCORE_CLASS = "flex-1 flex items-center gap-2.5 min-w-24"
const BAR_COLUMN_CLASS = "flex min-w-0 flex-1 flex-col gap-2"
const DIVIDER = <div className="w-px h-10 bg-white/5 shrink-0 mx-3.5 rounded-full" />
const BAR_GLOW = { boxShadow: '0 0 12px rgba(121, 80, 242, 0.7), 0 0 6px rgba(121, 80, 242, 0.4)' }

export function FriendActivityItemSkeleton() {
  return (
    <div className={CARD_CLASS}>
      <div className={USER_CLASS}>
        <SkeletonBox className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5 min-w-0">
          <SkeletonBox className="h-4 w-16 rounded-full" />
          <SkeletonBox className="h-4 w-10 rounded-full" />
        </div>
      </div>

      {DIVIDER}

      <div className={SCORE_CLASS}>
        <SkeletonBox className="w-8.5 h-10 shrink-0 rounded" />
        <div className={BAR_COLUMN_CLASS}>
          <SkeletonBox className="self-end h-4 w-8 rounded-full" />
          <SkeletonBox className="w-full h-2 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function FriendActivityItem({ friend }) {
  // Scores are 1-10, the tiers 0-100
  const percentage = friend.score * 10
  const { icon } = getScoreTier(percentage)

  return (
    <div className={`${CARD_CLASS} hover:border-surface-300 transition-colors`}>
      <Link to={`/profile/${friend.user_id}`} className={`${USER_CLASS} group cursor-pointer`}>
        <Avatar username={friend.username} avatarUrl={friend.avatar_url} />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-text truncate group-hover:text-primary-light transition-colors">
            {friend.username}
          </span>
          <span className="text-[10px] font-medium text-text-muted opacity-70 truncate">
            {timeAgo(friend.created_at)}
          </span>
        </div>
      </Link>

      {DIVIDER}

      <div className={SCORE_CLASS}>
        {/* Same height as the avatar; contain keeps each tier's own aspect ratio */}
        <div className="flex h-10 w-8.5 shrink-0 items-center justify-center">
          <img {...icon} decoding="async" className="max-h-full max-w-full object-contain" />
        </div>

        <div className={BAR_COLUMN_CLASS}>
          <span className="self-end text-lg font-semibold text-primary-lighter leading-none tracking-tight">
            {percentage}%
          </span>
          <div className="relative w-full h-2 bg-white/10 rounded-full">
            <div
              className="absolute top-0 left-0 h-full bg-primary-light rounded-full transition-all duration-1000 ease-out"
              style={{ ...BAR_GLOW, width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(FriendActivityItem)
