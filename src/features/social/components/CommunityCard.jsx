import { memo } from "react"
import { Link } from "react-router"
import { HiStar } from "react-icons/hi2"
import Avatar from "@/components/ui/Avatar"
import MoviePoster from "@/components/media/MoviePoster"
import SkeletonBox from "@/components/ui/SkeletonBox"
import SkeletonText from "@/components/ui/SkeletonText"
import { timeAgo } from "@/utils/timeAgo"
import getTmdbImageUrl from "@/utils/tmdbImage"

// Shared with the skeleton, so the card keeps its shape when the feed lands
const CARD_CLASS = "p-5 bg-surface-500 border border-surface-100 rounded-card flex flex-col gap-4"
const TITLE_BOX_CLASS = "flex gap-4 p-3 bg-surface-900/40 rounded-xl border border-white/5"
const POSTER_CLASS = "w-16 sm:w-20 shrink-0 aspect-2/3 rounded-md"

export function CommunityCardSkeleton() {
  return (
    <article className={CARD_CLASS}>
      <div className="flex items-center gap-3">
        <SkeletonBox className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <SkeletonBox className="h-4 w-32 rounded-full" />
          <SkeletonBox className="h-4 w-20 rounded-full" />
        </div>
        <SkeletonBox className="w-12 h-4 rounded-full shrink-0" />
      </div>

      <div className={TITLE_BOX_CLASS}>
        <SkeletonBox className={POSTER_CLASS} />
        <div className="flex flex-col justify-center gap-3 flex-1 min-w-0">
          <SkeletonText lines={2} />
          <SkeletonBox className="w-20 h-7 rounded-md" />
        </div>
      </div>
    </article>
  )
}

function CommunityCard({ item }) {
  // updated_at moves only when the score changes, so a later one means they changed their mind
  const edited = item.updated_at !== item.created_at

  return (
    <article className={CARD_CLASS}>
      <header className="flex items-center gap-3">
        <Link to={`/profile/${item.user_id}`} className="shrink-0">
          <Avatar avatarUrl={item.avatar_url} username={item.username} />
        </Link>

        <div className="flex-1 min-w-0 leading-tight">
          <Link
            to={`/profile/${item.user_id}`}
            className="font-bold text-text hover:text-primary-light transition-colors block truncate py-2 -my-2"
          >
            {item.username}
          </Link>
          <span className="text-text-muted text-xs block mt-0.5">
            {edited ? 'changed their rating' : <>rated a <span className="capitalize">{item.type}</span></>}
          </span>
        </div>

        <span className="text-xs text-text-muted font-medium whitespace-nowrap">
          {timeAgo(item.updated_at)}
        </span>
      </header>

      <Link
        to={`/browse/${item.tmdb_id}`}
        state={{ type: item.type }}
        className={`${TITLE_BOX_CLASS} hover:bg-surface-900/70 transition-colors`}
      >
        <MoviePoster src={getTmdbImageUrl(item.poster_path, 'w185')} alt={item.title} className={`${POSTER_CLASS} shadow-md text-xs`} />

        <div className="flex flex-col justify-center gap-2 min-w-0 flex-1">
          <h3 className="font-bold text-base sm:text-lg text-text leading-snug truncate">
            {item.title}
          </h3>

          <div className="flex items-center gap-1.5 bg-black/40 w-fit px-2.5 py-1 rounded-md border border-white/5">
            <HiStar className="text-amber-400 shrink-0" size={15} />
            <span className="font-bold text-text text-xs sm:text-sm tracking-wide">
              {edited && item.previous_score != null && (
                <span className="text-text-muted font-normal">{item.previous_score} → </span>
              )}
              {item.score} <span className="text-text-muted text-xs font-normal">/ 10</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export default memo(CommunityCard)
