import { useCallback, useMemo, memo, useRef } from "react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { HiOutlineBars3 } from "react-icons/hi2"
import { TbGridDots } from "react-icons/tb"
import { AutoSentinel } from "@/components/ui/LoadMoreFooter"
import MediaCard from "@/components/media/MediaCard"
import useMediaState from "@/features/interactions/hooks/useMediaState"
import useScrollArrows from "@/hooks/useScrollArrows"
import SkeletonBox from "@/components/ui/SkeletonBox"
import AlertBanner from "@/components/ui/AlertBanner"
import Chip from "@/components/ui/Chip"

// overscroll-x-contain: reaching the end of a row must not turn into the browser's swipe-back
const SCROLLER_CLASS = "flex gap-3 overflow-x-auto overscroll-x-contain -mx-4 px-4 md:mx-0 md:px-6 pb-2 scrollbar-hide"
const CARD_SLOT_CLASS = "flex-none w-32 sm:w-40 md:w-44"

function ExpandToggle({ isExpanded, isLoadingFirstPage, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text hover:bg-surface-500 px-3 py-3 md:py-1.5 rounded-md transition-colors duration-200 cursor-pointer"
    >
      {isLoadingFirstPage ? (
        <span className="w-3.5 h-3.5 border-2 border-text-muted/40 border-t-text-muted rounded-full animate-spin" />
      ) : isExpanded ? (
        <HiOutlineBars3 size={16} />
      ) : (
        <TbGridDots size={16} />
      )}
      {isLoadingFirstPage ? "Loading" : isExpanded ? "Collapse" : "View all"}
    </button>
  )
}

function PaginationControls({ page, totalPages, onPageChange, isPending, containerRef }) {
  if (!totalPages || totalPages <= 1) return null

  const handlePageClick = (newPage) => {
    onPageChange(newPage)
    if (containerRef?.current) {
      const top = containerRef.current.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex items-center justify-center gap-4 pt-6">
      <button
        type="button"
        onClick={() => handlePageClick(page - 1)}
        disabled={page <= 1}
        className="w-11 h-11 md:w-8 md:h-8 rounded-full bg-surface-900/80 backdrop-blur border border-surface-100/40 flex items-center justify-center text-text-muted hover:scale-110 hover:bg-surface-800 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
      >
        <FiChevronLeft size={16} />
      </button>
      
      <div className={`transition-opacity duration-200 ${isPending ? "opacity-50" : "opacity-100"}`}>
        <Chip label={`Page ${page} of ${totalPages}`} size="sm" variant="ghost" />
      </div>

      <button
        type="button"
        onClick={() => handlePageClick(page + 1)}
        disabled={page >= totalPages}
        className="w-11 h-11 md:w-8 md:h-8 rounded-full bg-surface-900/80 backdrop-blur border border-surface-100/40 flex items-center justify-center text-text-muted hover:scale-110 hover:bg-surface-800 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  )
}

function MediaRow({
  heading, data, isLoading, isError, limit = Infinity,
  // Hold the loading skeleton back 150ms (delayed-reveal) so a fast response never flashes it
  delaySkeleton = false,
  // Row infinite scroll: `hasMore` mounts the sentinel that calls `onLoadMore`
  onLoadMore, hasMore = false,
  rank = true, showFavorite = false,
  // Star chip with the title's score: the row's own `score` (ratings rows) or the signed-in user's rating
  showRating = false,
  showWatchlist = false,
  showInfo = true,
  // Fallback media type for items that don't carry their own media_type/type
  // (e.g. TMDB category endpoints like /tv/popular omit media_type on items).
  mediaType,
  // grid/expand additions — all optional, row-only usage is unaffected
  expandable = false, isExpanded = false, isPending = false, onToggleExpand,
  gridItems, gridError, page = 1, totalPages = 1, onPageChange,
}) {
  // Row data — an array of normalised items (see src/utils/pagination.js)
  // TMDB's popularity-sorted lists shift between page requests, so a title can come back on two
  // pages. Rendering it twice would also give two cards the same key.
  const media = useMemo(() => {
    if (!Array.isArray(data)) return []
    const seen = new Set()
    return data
      .filter((item) => {
        const id = item.tmdb_id || item.id
        if (seen.has(id)) return false
        seen.add(id)
        return true
      })
      .slice(0, limit)
  }, [data, limit])

  // One subscription per row; cards receive primitives so only the affected card re-renders
  const { favorites, watchlist, ratings } = useMediaState()

  const { showLeft, showRight, scrollRef, scrollByAmount } = useScrollArrows()

  const handleScrollLeft = useCallback(() => {
    scrollByAmount(-400)
  }, [scrollByAmount])

  const handleScrollRight = useCallback(() => {
    scrollByAmount(400)
  }, [scrollByAmount])

  const containerRef = useRef(null)

  // isExpanded flips the moment the button is clicked (so it feels
  // responsive), but the layout itself only swaps once the first grid
  // page has actually arrived — otherwise toggling would flash an empty
  // grid. Until then we just keep showing the row a beat longer.
  const showGrid = isExpanded && Boolean(gridItems)
  const isLoadingFirstPage = isExpanded && !gridItems

  function renderCard(item, rankValue) {
    const cardId = item.tmdb_id || item.id
    return (
      <MediaCard
        id={cardId}
        type={item.media_type || item.type || mediaType}
        title={item.title || item.name}
        posterPath={item.poster_path}
        releaseDate={item.release_date || item.first_air_date}
        voteAverage={item.vote_average}
        genreIds={item.genre_ids}
        isAdult={item.adult}
        userRating={showRating ? (item.score ?? ratings.get(Number(cardId))) : undefined}
        rank={rankValue}
        showFavorite={showFavorite}
        showInfo={showInfo}
        isFavorited={favorites.has(Number(cardId))}
        showWatchlist={showWatchlist}
        isWatchlisted={watchlist.has(Number(cardId))}
      />
    )
  }

  if (isLoading) return (
    <div className={delaySkeleton ? "delayed-reveal" : undefined}>
      {heading && <h2 className="text-text font-semibold text-xl mb-4 md:px-6">{heading}</h2>}
      <div className={SCROLLER_CLASS}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={CARD_SLOT_CLASS}>
            <SkeletonBox className="w-full aspect-2/3 rounded-card" />
          </div>
        ))}
      </div>
    </div>
  )

  if (isError) return (
    <div>
      {heading && <h2 className="text-text font-semibold text-xl mb-4 md:px-6">{heading}</h2>}
      <AlertBanner variant="danger" message="Couldn't load this. Please try again." />
    </div>
  )
  if (!data) return null

  return (
    <div ref={containerRef}>
      {/* Optional: a host that titles the row itself (e.g. a detail page tab) passes no heading */}
      {(heading || expandable) && (
        <div className="flex items-center justify-between mb-4 md:px-6">
          <h2 className="text-text font-semibold text-xl">{heading}</h2>
          {expandable && (
            <ExpandToggle
              isExpanded={isExpanded}
              isLoadingFirstPage={isLoadingFirstPage}
              onToggle={onToggleExpand}
            />
          )}
        </div>
      )}

      {showGrid ? (
        <div className="md:px-6">
          {gridError ? (
            <AlertBanner variant="danger" message="Couldn't load this. Please try again." />
          ) : (
            <>
              <div
                className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}
              >
                {gridItems.map((item) => (
                  <div key={item.tmdb_id || item.id}>
                    {/* rank numbers don't mean much past page 1 of an
                        arbitrary genre browse, so grid mode never shows them */}
                    {renderCard(item, undefined)}
                  </div>
                ))}
              </div>

              <PaginationControls
                page={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
                isPending={isPending}
                containerRef={containerRef}
              />
            </>
          )}
        </div>
      ) : (
        <div className="relative group/row">
          {/* Left arrow. Hover-revealed, so on touch (no hover) it would be an invisible button
              stealing taps from the card under it: there the row is swiped instead. */}
          {showLeft && (
            <button onClick={handleScrollLeft} className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-surface-900/80 backdrop-blur border border-surface-100/40 flex pointer-coarse:hidden items-center justify-center text-text-muted opacity-0 group-hover/row:opacity-100 hover:scale-110 hover:bg-surface-800 transition-all duration-200">
              <FiChevronLeft size={16} />
            </button>
          )}

          {/* Scrollable row */}
          <div ref={scrollRef} className={`${SCROLLER_CLASS} scroll-smooth`}>
            {media.map((item, index) => (
              <div key={item.tmdb_id || item.id} className={CARD_SLOT_CLASS}>
                {renderCard(item, rank ? index + 1 : undefined)}
              </div>
            ))}

            {hasMore && (
              <AutoSentinel
                key={media.length}
                onIntersect={onLoadMore}
                className="flex-none w-1 h-full"
              />
            )}
          </div>

          {/* Right arrow */}
          {showRight && (
            <button onClick={handleScrollRight} className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-surface-900/80 backdrop-blur border border-surface-100/40 flex pointer-coarse:hidden items-center justify-center text-text-muted opacity-0 group-hover/row:opacity-100 hover:scale-110 hover:bg-surface-800 transition-all duration-200">
              <FiChevronRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default memo(MediaRow)