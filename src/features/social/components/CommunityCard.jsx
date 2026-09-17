import { memo } from "react"
import { Link } from "react-router"
import { HiStar, HiOutlineUser } from "react-icons/hi2"
import { timeAgo } from "@/utils/timeAgo"
import getTmdbImageUrl from "@/utils/tmdbImage"

const ActivityCard = memo(function ActivityCard({ item }) {
  return (
    <article className="p-5 bg-surface-500 border border-surface-100 rounded-card flex flex-col gap-4">
      
      {/* 1. SOCIAL HEADER */}
      <header className="flex items-center gap-3">
        <Link to={`/profile/${item.user_id}`} className="shrink-0">
          {item.avatar_url ? (
            <img 
              src={item.avatar_url} 
              alt={item.username} 
              className="w-10 h-10 rounded-full object-cover border border-surface-100 bg-surface-900"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border border-surface-100 bg-surface-900 flex items-center justify-center text-text-muted">
              <HiOutlineUser size={20} />
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0 leading-tight">
          <Link 
            to={`/profile/${item.user_id}`} 
            className="font-bold text-text hover:text-primary-light transition-colors block truncate"
          >
            {item.username}
          </Link>
          <span className="text-text-muted text-xs block mt-0.5">
            rated a <span className="capitalize">{item.type}</span>
          </span>
        </div>

        <span className="text-xs text-text-muted font-medium whitespace-nowrap">
          {timeAgo(item.created_at)}
        </span>
      </header>

      {/* 2. MEDIA TARGET*/}
      <Link
        to={`/browse/${item.tmdb_id}`}
        state={{ type: item.type }}
        className="flex gap-4 p-3 bg-surface-900/40 rounded-xl border border-white/5 hover:bg-surface-900/70 transition-colors"
      >
        {/* Poster Wrapper */}
        <div className="w-16 sm:w-20 shrink-0 shadow-md rounded-md overflow-hidden bg-surface-100 aspect-2/3">
          {item.poster_path ? (
            <img 
              src={getTmdbImageUrl(item.poster_path, 'w185')} 
              alt={item.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-text-muted text-center p-1 bg-surface-500">
              No Poster
            </div>
          )}
        </div>

        {/* Information Stack */}
        <div className="flex flex-col justify-center gap-2 min-w-0 flex-1">
          <h3 className="font-bold text-base sm:text-lg text-text leading-snug truncate">
            {item.title}
          </h3>

          <div className="flex items-center gap-1.5 bg-black/40 w-fit px-2.5 py-1 rounded-md border border-white/5">
            <HiStar className="text-amber-400 shrink-0" size={15} />
            <span className="font-bold text-text text-xs sm:text-sm tracking-wide">
              {item.score} <span className="text-text-muted text-xs font-normal">/ 10</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
})

export default ActivityCard