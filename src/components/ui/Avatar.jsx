import { HiOutlineUser } from "react-icons/hi2"

// Presentational only. Every place that shows an avatar already sits inside the link to that
// profile, and a link of its own would nest one <a> in another.
export default function Avatar({ avatarUrl, username, sizeClass = "w-10 h-10", iconSize = 20 }) {
  return (
    <div
      className={`shrink-0 rounded-full overflow-hidden border border-surface-100 bg-surface-900 flex items-center justify-center group ${sizeClass}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <HiOutlineUser
          size={iconSize}
          className="text-text-muted group-hover:text-text transition-colors duration-200"
        />
      )}
    </div>
  )
}
