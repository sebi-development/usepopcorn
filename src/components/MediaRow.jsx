import { useCallback, useMemo, memo } from "react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import useIntersectionObserver from "../hooks/useIntersectionObserver"
import MediaCard from "./MediaCard"
import useScrollArrows from "../hooks/useScrollArrows"
import SkeletonBox from "./skeletons/components/SkeletonBox"
import AlertBanner from "./AlertBanner"

function MediaRow({ heading, data, isLoading, isError, limit = Infinity, fetchNextPage, hasNextPage, isFetchingNextPage, rank = true, showFavorite = false, favoritedSet }) {
  // Media data from api
  const media = useMemo(() => {
    if (!data) return []
    if (data.pages) return data.pages.flatMap(page => page.results)
    return Array.isArray(data) ? data.slice(0, limit) : []
  }, [data, limit])

  const { showLeft, showRight, scrollRef, scrollByAmount } = useScrollArrows()

  function handleScrollLeft() {
    scrollByAmount(-400)
  }

  function handleScrollRight() {
    scrollByAmount(400)
  }

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const sentinelRef = useIntersectionObserver(handleIntersect)

  if (isLoading) return (
    <div>
      <h2 className="text-text font-semibold text-xl mb-4 px-6">{heading}</h2>
      <div className="flex gap-3 overflow-x-auto px-6 pb-2 scrollbar-hide">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex-none w-36 sm:w-40 md:w-44">
            <SkeletonBox className="w-full aspect-2/3 rounded-card" />
          </div>
        ))}
      </div>
    </div>
  )

  if (isError) return (
  <div>
    <h2 className="text-text font-semibold text-xl mb-4 px-6">{heading}</h2>
    <AlertBanner variant="danger" message="Couldn't load this. Please try again." />
  </div>
)
  if (!data) return null

  return (
    <div>
      <h2 className="text-text font-semibold text-xl mb-4 px-6">{heading}</h2>
      <div className="relative group/row">
        {/* Left arrow */}
        {showLeft && (
          <button onClick={handleScrollLeft} className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-surface-900/80 backdrop-blur border border-surface-100/40 flex items-center justify-center text-text-muted opacity-0 group-hover/row:opacity-100 hover:scale-110 hover:bg-surface-800 transition-all duration-200">
            <FiChevronLeft size={16} />
          </button>
        )}

        {/* Scrollable row */}
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scroll-smooth px-6 pb-2 scrollbar-hide">
          {media.map((item, index) => (
            <div key={item.tmdb_id || item.id} className="flex-none w-36 sm:w-40 md:w-44">
              <MediaCard
                id={item.tmdb_id || item.id}
                type={item.media_type || item.type}
                title={item.title || item.name}
                posterPath={item.poster_path}
                userRating={item.score}
                rank={rank ? index + 1 : undefined}
                showFavorite={showFavorite}
                isFavorited={favoritedSet?.has(item.tmdb_id || item.id)}
              />
            </div>
          ))}

          <div ref={sentinelRef} className="flex-none w-1 h-full" />
        </div>

        {/* Right arrow */}
        {showRight && (
          <button onClick={handleScrollRight} className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-surface-900/80 backdrop-blur border border-surface-100/40 flex items-center justify-center text-text-muted opacity-0 group-hover/row:opacity-100 hover:scale-110 hover:bg-surface-800 transition-all duration-200">
            <FiChevronRight size={16} />
          </button>
        )}

      </div>
    </div>
  )
}

export default memo(MediaRow)