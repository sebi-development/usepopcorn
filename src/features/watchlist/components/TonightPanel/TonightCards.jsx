import { memo } from "react"
import { Link } from "react-router"
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs"
import MediaCard from "@/components/media/MediaCard"
import { CARD_ACTIONS } from "@/components/media/cardActions"
import MoviePoster from "@/components/media/MoviePoster"
import ArrowLink from "@/components/ui/ArrowLink"
import Button from "@/components/ui/Button"
import Chip from "@/components/ui/Chip"
import SkeletonBox from "@/components/ui/SkeletonBox"
import useWatchlistPin from "@/features/interactions/hooks/useWatchlistPin"
import { lengthLabel } from "@/features/watchlist/utils/watchlistItems"
import { getGenreNames } from "@/utils/genres"
import getTmdbImageUrl from "@/utils/tmdbImage"
import { titleKey } from "@/utils/tmdbItem"

// A phone lists the lead first; desktop puts it in the middle, larger, with the other two dimmed
const ROW_CLASS = "grid grid-cols-3 gap-2 md:flex md:items-end md:justify-center md:gap-3.5"
const SLOT_CLASS = ["md:order-2 md:w-52", "md:order-1 md:w-40 md:opacity-85", "md:order-3 md:w-40 md:opacity-85"]
const LEAD_RING = "ring-2 ring-primary-light shadow-xl shadow-primary/30"
// A Draw click: each new card fades in, one after another (opacity only)
const FADE_IN = "animate-[overlay-fade_400ms_var(--ease-out-quint)_both] motion-reduce:animate-none"

// "2016 · Science Fiction, Drama"
const detailsOf = (item, genres = 2) => [item.release_date?.slice(0, 4), getGenreNames(item.genre_ids ?? [], item.media_type).slice(0, genres).join(", ")]
  .filter(Boolean)
  .join(" · ")

function Note({ title, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-10 md:py-20 rounded-2xl border border-dashed border-surface-300 text-center">
      <p className="text-base font-semibold text-text">{title}</p>
      <p className="text-sm text-text-muted">{children}</p>
    </div>
  )
}

const NOTES = {
  error: ["Couldn't load your watchlist", "Please try again."],
  empty: ["Nothing saved yet", <ArrowLink key="find" to="/browse?type=movies&category=trending" className="text-primary-light">Find something to watch</ArrowLink>],
  none: ["Nothing saved fits that", "Try a different length or mood."],
}

// Tonight's three cards. `isDrawn`: the user has drawn; until then a phone shows only the lead, as one
// wide card. `isPick`: the lead is today's pick.
function TonightCards({ status, drawn, drawKey, isDrawn, isPick, animate, className = "" }) {
  const togglePin = useWatchlistPin()
  // Until the first draw a phone shows the wide lead card in place of the row
  const rowClass = `${isDrawn ? "" : "max-md:hidden"} ${ROW_CLASS}`

  if (status === "loading") return (
    <div className={`delayed-reveal flex flex-col justify-center ${className}`}>
      {!isDrawn && <SkeletonBox className="md:hidden h-31 rounded-2xl" />}
      <div className={rowClass}>
        {SLOT_CLASS.map((slot) => <SkeletonBox key={slot} className={`aspect-2/3 rounded-card ${slot}`} />)}
      </div>
    </div>
  )

  if (NOTES[status]) return (
    <div className={`flex flex-col justify-center ${className}`}>
      <Note title={NOTES[status][0]}>{NOTES[status][1]}</Note>
    </div>
  )

  const lead = drawn[0]
  const leadPinned = lead.pinned_at != null

  return (
    <div className={`flex flex-col justify-center gap-4 ${className}`}>
      {!isDrawn && (
        <Link
          to={`/browse/${lead.tmdb_id}`}
          state={{ type: lead.media_type }}
          className="md:hidden flex items-center gap-3 p-2 rounded-2xl bg-surface-900 border border-white/5"
        >
          <MoviePoster src={getTmdbImageUrl(lead.poster_path, "w185")} alt={lead.title} className="w-18 shrink-0 aspect-2/3 rounded-[10px]" />
          <span className="flex flex-col items-start gap-1 min-w-0">
            {isPick && <Chip variant="tint" size="sm" label="Today's pick" />}
            <span className="max-w-full text-base font-semibold text-text truncate">{lead.title}</span>
            <span className="max-w-full text-xs text-text-muted truncate">{[detailsOf(lead, 1), lengthLabel(lead)].filter(Boolean).join(" · ")}</span>
          </span>
        </Link>
      )}

      {/* Keyed by the draw, so every card of a new draw mounts (and fades in) */}
      <div key={drawKey} className={rowClass}>
        {drawn.map((item, i) => {
          const key = titleKey(item.media_type, item.tmdb_id)
          return (
            <div key={key} className={`min-w-0 ${SLOT_CLASS[i]}`}>
              <div className={`flex flex-col gap-2 ${animate ? FADE_IN : ""}`} style={animate ? { animationDelay: `${i * 70}ms` } : undefined}>
                {/* The caption below has the details, so no info overlay */}
                <MediaCard
                  id={item.tmdb_id}
                  type={item.media_type}
                  title={item.title}
                  posterPath={item.poster_path}
                  releaseDate={item.release_date}
                  genreIds={item.genre_ids}
                  badge={lengthLabel(item)}
                  showInfo={false}
                  actions={CARD_ACTIONS.watchlist}
                  isWatchlisted
                  isPinned={item.pinned_at != null}
                  className={i === 0 ? LEAD_RING : ""}
                />
                <div className="min-w-0 px-0.5">
                  {i === 0 && isPick && <Chip variant="tint" size="xs" label="Today's pick" className="max-md:hidden mb-1" />}
                  <p className="text-xs md:text-sm font-semibold text-text truncate">{item.title}</p>
                  <p className="max-md:hidden text-xs text-text-muted truncate">{detailsOf(item)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="max-md:hidden flex flex-wrap justify-center gap-2">
        <Button as={Link} to={`/browse/${lead.tmdb_id}`} state={{ type: lead.media_type }}>
          <span className="block max-w-64 truncate">Watch {lead.title}</span>
        </Button>
        <Button variant="secondary" onClick={() => togglePin(lead, leadPinned)} aria-pressed={leadPinned}>
          <span className="inline-flex items-center gap-2">
            {leadPinned ? <BsPinAngleFill className="text-primary-light" /> : <BsPinAngle />}
            {leadPinned ? "Pinned to Up next" : "Pin to Up next"}
          </span>
        </Button>
      </div>
    </div>
  )
}

export default memo(TonightCards)
