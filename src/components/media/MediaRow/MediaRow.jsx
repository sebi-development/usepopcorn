import { useCallback, useMemo, memo, useRef } from "react"
import { Link } from "react-router"
import { HiOutlineBars3 } from "react-icons/hi2"
import { TbGridDots } from "react-icons/tb"
import { AutoSentinel } from "@/components/ui/LoadMoreFooter"
import MediaCard from "@/components/media/MediaCard"
import ArrowButton from "@/components/media/MediaRow/ArrowButton"
import PaginationControls from "@/components/media/MediaRow/PaginationControls"
import useMediaState from "@/features/interactions/hooks/useMediaState"
import useScrollArrows from "@/hooks/useScrollArrows"
import SkeletonBox from "@/components/ui/SkeletonBox"
import AlertBanner from "@/components/ui/AlertBanner"
import Chip from "@/components/ui/Chip"

// Shared by the skeleton and the loaded row, so the row keeps its box when the data lands
const SCROLLER_CLASS = "flex gap-3 overflow-x-auto overscroll-x-contain -mx-4 px-4 md:mx-0 md:px-6 pb-2 scrollbar-hide"
const CARD_SLOT_CLASS = "flex-none w-32 sm:w-40 md:w-44"
// Hover-revealed, so on touch (no hover) they'd be invisible buttons stealing taps from the cards: there the row is swiped
const SCROLL_ARROW_CLASS = "absolute top-1/2 -translate-y-1/2 z-20 w-8 h-8 pointer-coarse:hidden opacity-0 group-hover/row:opacity-100"
const ERROR_MESSAGE = "Couldn't load this. Please try again."
const SKELETON_CARDS = [1, 2, 3, 4, 5, 6, 7, 8]
const SCROLL_STEP = 400

// One header for every state, so it never changes height (a layout shift) as the row loads
function RowHeader({ title, children }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-4 md:px-6">
      <h2 className="text-text font-semibold text-xl">{title}</h2>
      {children}
    </div>
  )
}

const TOGGLE_CLASS = "flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm text-text-muted hover:text-text hover:bg-surface-500 px-2 md:px-3 py-3 md:py-1.5 rounded-md transition-colors duration-200 cursor-pointer"

// "View all" that opens another page (the toggle's look)
function ViewAllLink({ to }) {
  return (
    <Link to={to} className={TOGGLE_CLASS}>
      <TbGridDots size={16} />
      View all
    </Link>
  )
}

function ExpandToggle({ isExpanded, isLoadingFirstPage, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={TOGGLE_CLASS}
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
  // Renders an item that isn't a title (e.g. a cast member) in place of MediaCard
  renderItem,
  // Watchlist rows: `badgeOf(item)` is the card's bottom-left chip, `showAdded` its "Added …" line
  badgeOf, showAdded = false,
  // A "View all" link to another page, in place of the in-place expand toggle
  viewAllTo,
  // Shown as a count chip after the heading
  count,
  // Shown in place of the row when the loaded list is empty (e.g. no title matches the filters)
  emptyNote,
}) {
  const title = count == null ? heading : <>{heading}<Chip variant="count" size="sm" label={count} className="ml-2 align-middle" /></>
  const hasHeader = heading || expandable || viewAllTo
  // Movie and TV ids overlap, so a list mixing both (a person's credits) keys by type too
  const keyOf = useCallback(
    (item) => `${item.media_type || item.type || mediaType}:${item.tmdb_id || item.id}`,
    [mediaType]
  )

  // Row data — an array of normalised items (see src/utils/pagination.js)
  // TMDB's popularity-sorted lists shift between page requests, so a title can come back on two
  // pages. Rendering it twice would also give two cards the same key.
  const media = useMemo(() => {
    if (!Array.isArray(data)) return []
    const seen = new Set()
    return data
      .filter((item) => {
        const key = keyOf(item)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, limit)
  }, [data, limit, keyOf])

  // One subscription per row; cards receive primitives so only the affected card re-renders
  const { favorites, watchlist, ratings } = useMediaState()

  const { showLeft, showRight, scrollRef, scrollByAmount } = useScrollArrows()
  const handleScrollLeft = useCallback(() => scrollByAmount(-SCROLL_STEP), [scrollByAmount])
  const handleScrollRight = useCallback(() => scrollByAmount(SCROLL_STEP), [scrollByAmount])

  const containerRef = useRef(null)

  // isExpanded flips the moment the button is clicked (so it feels responsive), but the layout only
  // swaps once the first grid page has arrived, or toggling would flash an empty grid
  const showGrid = isExpanded && Boolean(gridItems)
  const isLoadingFirstPage = isExpanded && !gridItems

  function renderCard(item, rankValue) {
    if (renderItem) return renderItem(item)
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
        badge={badgeOf?.(item)}
        addedAt={showAdded ? item.created_at : undefined}
        rank={rankValue}
        showFavorite={showFavorite}
        showInfo={showInfo}
        isFavorited={favorites.has(Number(cardId))}
        showWatchlist={showWatchlist}
        isWatchlisted={watchlist.has(Number(cardId))}
      />
    )
  }

  // Same box structure as the loaded row: a reused node that changes role (scroller -> wrapper) is a layout shift
  if (isLoading) return (
    <div className={delaySkeleton ? "delayed-reveal" : undefined}>
      {hasHeader && (
        <RowHeader title={title}>
          {/* Holds the toggle's room, so "View all" appearing doesn't grow the header */}
          {(expandable || viewAllTo) && <span aria-hidden="true" className="invisible shrink-0 whitespace-nowrap text-sm px-2 md:px-3 py-3 md:py-1.5">View all</span>}
        </RowHeader>
      )}
      <div className="relative group/row">
        <div className={SCROLLER_CLASS}>
          {SKELETON_CARDS.map((i) => (
            <div key={i} className={CARD_SLOT_CLASS}>
              <SkeletonBox className="w-full aspect-2/3 rounded-card" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (isError) return (
    <div>
      {heading && <RowHeader title={title} />}
      <AlertBanner variant="danger" message={ERROR_MESSAGE} />
    </div>
  )
  if (!data) return null

  if (emptyNote && (showGrid ? gridItems : media).length === 0) return (
    <div>
      {heading && <RowHeader title={title} />}
      <p className="text-sm text-text-muted md:px-6">{emptyNote}</p>
    </div>
  )

  return (
    <div ref={containerRef}>
      {/* Optional: a host that titles the row itself (e.g. a detail page tab) passes no heading */}
      {hasHeader && (
        <RowHeader title={title}>
          {expandable ? (
            <ExpandToggle isExpanded={isExpanded} isLoadingFirstPage={isLoadingFirstPage} onToggle={onToggleExpand} />
          ) : viewAllTo && <ViewAllLink to={viewAllTo} />}
        </RowHeader>
      )}

      {showGrid ? (
        <div className="md:px-6">
          {gridError ? (
            <AlertBanner variant="danger" message={ERROR_MESSAGE} />
          ) : (
            <>
              <div
                className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}
              >
                {/* Rank numbers say little past page 1 of a genre browse, so the grid never shows them */}
                {gridItems.map((item) => (
                  <div key={keyOf(item)}>{renderCard(item, undefined)}</div>
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
          {showLeft && <ArrowButton direction="left" onClick={handleScrollLeft} aria-label="Scroll left" className={`${SCROLL_ARROW_CLASS} left-1`} />}

          <div ref={scrollRef} className={`${SCROLLER_CLASS} scroll-smooth`}>
            {media.map((item, index) => (
              <div key={keyOf(item)} className={CARD_SLOT_CLASS}>
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

          {showRight && <ArrowButton direction="right" onClick={handleScrollRight} aria-label="Scroll right" className={`${SCROLL_ARROW_CLASS} right-1`} />}
        </div>
      )}
    </div>
  )
}

export default memo(MediaRow)
