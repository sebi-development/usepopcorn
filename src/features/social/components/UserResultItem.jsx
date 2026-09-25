import { memo } from "react"
import { Link } from "react-router"
import { FaCirclePlus, FaCircleCheck } from "react-icons/fa6"
import toast from "react-hot-toast"
import Tooltip from "@/components/ui/Tooltip"
import Avatar from "@/components/ui/Avatar"
import useFollow from "@/features/social/hooks/useFollow"

const UserResultItem = memo(function UserResultItem({ user, subtitle, isFollowing = false }) {
  const { mutate: toggleFollow, isPending } = useFollow(user.id)

  const isBusy = isPending

  function handleToggleFollow(e) {
    // Prevent the click from also triggering the wrapping <Link>
    e.preventDefault()
    e.stopPropagation()
    if (isBusy) return

    toggleFollow(isFollowing, {
      onSuccess: () => {
        toast.success(isFollowing ? `Unfollowed ${user.username}` : `Following ${user.username}`)
      }
    })
  }

  return (
    <Link
      to={`/profile/${user.id}`}
      className="flex items-center gap-3 p-2 rounded-xl border-b border-surface-100 last:border-transparent hover:bg-surface-100 transition-colors duration-200 cursor-pointer group/row"
    >
      <Avatar
        userId={user.id}
        avatarUrl={user.avatar_url}
        username={user.username}
        sizeClass="w-9 h-9"
        iconSize={18}
      />

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-sm font-medium text-text truncate group-hover/row:text-primary-light transition-colors leading-tight">
          {user.username}
        </p>

        {/* Only suggestions pass this — search results stay clean without it */}
        {subtitle && (
          <span className="text-[10px] text-text-muted truncate mt-0.5">
            {subtitle}
          </span>
        )}
      </div>

      <Tooltip label={isFollowing ? "Unfollow" : "Follow"} side="left">
        <button
          onClick={handleToggleFollow}
          disabled={isBusy}
          className="relative flex items-center justify-center p-1.5 rounded-full transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
          aria-label={isFollowing ? "Following" : "Follow user"}
        >
          {isFollowing ? (
            <FaCircleCheck className="text-primary-light" size={18} />
          ) : (
            <FaCirclePlus className="text-text-muted hover:text-text transition-colors duration-200" size={18} />
          )}
        </button>
      </Tooltip>
    </Link>
  )
})

export default UserResultItem