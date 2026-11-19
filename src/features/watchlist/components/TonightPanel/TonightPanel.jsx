import { memo, useCallback, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { BsShuffle } from "react-icons/bs"
import Button from "@/components/ui/Button"
import Chip from "@/components/ui/Chip"
import SlidingTabs from "@/components/ui/SlidingTabs"
import useWatchlistPick from "@/features/interactions/hooks/useWatchlistPick"
import TonightCards from "@/features/watchlist/components/TonightPanel/TonightCards"
import { LENGTH_LABELS, MOODS, onlyType } from "@/features/watchlist/constants/filters"
import { drawTitles } from "@/features/watchlist/utils/watchlistItems"
import { IN_PLACE } from "@/hooks/useUrlFilters"
import { toDay } from "@/utils/dates"

// The draw's seed, in the URL so Back from a title shows the same three. Without one: today's pick and
// two titles that stay the same all day.
const DRAW_PARAM = "draw"

const TYPE_TABS = [
  { id: "", label: "All" },
  { id: "movie", label: "Movie night", shortLabel: "Movies" },
  { id: "tv", label: "Binge a series", shortLabel: "Series" },
]
const LENGTHS = ["short", "medium", "long"]
// Desktop length tabs per type, '' = any length (hoisted: SlidingTabs re-measures when its tabs change)
const LENGTH_TABS = Object.fromEntries(Object.entries(LENGTH_LABELS).map(([type, labels]) => (
  [type, [{ id: "", label: "Any length" }, ...LENGTHS.map((id) => ({ id, label: labels[id] }))]]
)))
const LENGTH_HEADINGS = { movie: "How much time?", tv: "How long a binge?" }
// '' = no mood
const MOOD_CARDS = [{ id: "", label: "Surprise me", hint: "Anything goes" }, ...Object.entries(MOODS).map(([id, { label, hint }]) => ({ id, label, hint }))]

const PHONE_CHIP = "flex-none min-h-11 whitespace-nowrap"

const sameTitle = (a, b) => a.tmdb_id === b.tmdb_id && a.media_type === b.media_type

// "What's on tonight?": the big front for the Type, Length and Mood filters (the same URL filters as the
// All saved grid below) and three titles drawn from what they leave.
function TonightPanel({ items, shown, filters, setFilter, setFilters, isLoading, isError }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const seed = searchParams.get(DRAW_PARAM)
  const { data: pick, isLoading: isPickLoading } = useWatchlistPick()
  // Set by a Draw click, so a draw fades in but a remount (Back from a title) shows the cards at once
  const [animate, setAnimate] = useState(false)

  const day = toDay(new Date())
  // Until the first draw the lead is today's pick, while the filters leave it in
  const drawn = useMemo(() => drawTitles(shown, seed ?? day, seed ? null : pick), [shown, seed, day, pick])
  const isPick = !seed && Boolean(pick) && drawn.length > 0 && sameTitle(drawn[0], pick)

  const total = items.length
  const lengthType = filters.type ?? onlyType(items)
  // Before the list loads, assume both types (most lists), so the tabs don't pop in
  const showType = isLoading || (total > 0 && !onlyType(items))

  const draw = useCallback(() => {
    setAnimate(true)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set(DRAW_PARAM, Math.random().toString(36).slice(2, 8))
      return next
    }, IN_PLACE)
  }, [setSearchParams])

  // A new type starts on any length: a movie's "Under 90 min" isn't a series' "1 season"
  const setType = useCallback((type) => setFilters({ ...filters, type: type || undefined, length: undefined }), [filters, setFilters])
  const setLength = useCallback((length) => setFilter("length", length || undefined), [setFilter])
  // Tapping the picked option again clears it
  const toggle = (key, value) => setFilter(key, !value || filters[key] === value ? undefined : value)

  // Fewer than three left: one tap widens the search, length first (Streaming is set in All saved's filters)
  const widen = isLoading || shown.length >= 3 ? null
    : filters.length ? { key: "length", label: "Any length" }
    : filters.mood ? { key: "mood", label: "Surprise me" }
    : filters.streaming ? { key: "streaming", label: "Any service" }
    : null

  const status = isError ? "error"
    : isLoading || isPickLoading ? "loading"
    : total === 0 ? "empty"
    : shown.length === 0 ? "none"
    : "ready"

  return (
    <section aria-labelledby="tonight-heading" className="flex flex-col md:flex-row md:flex-wrap gap-4 md:gap-8 p-4 md:p-7 rounded-3xl md:rounded-[28px] bg-surface-500 border border-white/5 md:mx-6">
      {/* On a phone its parts join the panel's column, so Draw can sit under the cards */}
      <div className="contents md:flex md:flex-col md:gap-7 md:flex-[1_1_340px] md:min-w-0">
        <div className="flex flex-col items-start gap-2">
          <h1 id="tonight-heading" className="heading-page text-shine">What's on tonight?</h1>
          <p className="max-md:hidden text-base text-text-muted">Pick what you're in for, then draw three. The list below follows along.</p>
        </div>

        {showType && (
          <SlidingTabs
            tabs={TYPE_TABS}
            activeTab={filters.type ?? ""}
            onChange={setType}
            fill
            tabClassName="max-md:min-h-11 max-sm:text-[13px]"
          />
        )}

        {/* Phone: the type's lengths, then the moods, in one scroller */}
        <div className="md:hidden flex gap-2 overflow-x-auto overscroll-x-contain scrollbar-hide -mx-4 px-4">
          {lengthType && LENGTHS.map((length) => (
            <Chip
              key={length}
              variant="outline"
              active={filters.length === length}
              aria-pressed={filters.length === length}
              onClick={() => toggle("length", length)}
              label={LENGTH_LABELS[lengthType][length]}
              className={PHONE_CHIP}
            />
          ))}
          {MOOD_CARDS.slice(1).map(({ id, label }) => (
            <Chip
              key={id}
              variant="outline"
              active={filters.mood === id}
              aria-pressed={filters.mood === id}
              onClick={() => toggle("mood", id)}
              label={label}
              className={PHONE_CHIP}
            />
          ))}
        </div>

        {/* Desktop: length tabs (or how to get them), then two-line mood cards */}
        <div className="max-md:hidden flex flex-col items-start gap-3">
          <h2 className="heading-group">{LENGTH_HEADINGS[lengthType] ?? "How much time?"}</h2>
          {lengthType
            ? <SlidingTabs tabs={LENGTH_TABS[lengthType]} activeTab={filters.length ?? ""} onChange={setLength} />
            : <p className="-mt-2 text-sm text-text-muted">Pick Movie night for running time, or Binge a series for number of seasons.</p>}
        </div>
        <div className="max-md:hidden flex flex-col gap-3">
          <h2 className="heading-group">What mood?</h2>
          <div className="flex flex-wrap gap-2">
            {MOOD_CARDS.map(({ id, label, hint }) => {
              const active = (filters.mood ?? "") === id
              return (
                <Chip key={id || "any"} variant="outline" active={active} aria-pressed={active} onClick={() => toggle("mood", id)} className="rounded-2xl! py-2.5!">
                  <span className="flex flex-col items-start gap-0.5 text-left">
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-[11px] font-normal tracking-normal text-text-muted">{hint}</span>
                  </span>
                </Chip>
              )
            })}
          </div>
        </div>

        <div className="max-md:order-last flex flex-wrap items-center gap-x-3 gap-y-2">
          <Button size="lg" onClick={draw} disabled={isLoading || shown.length < 2} className="max-md:w-full max-md:min-h-12">
            <span className="inline-flex items-center gap-2">
              <BsShuffle />
              {seed ? "Draw again" : "Draw 3"}
            </span>
          </Button>
          {!isLoading && (
            <span className="text-sm text-text-muted">{shown.length} {shown.length === 1 ? "title matches" : "titles match"}</span>
          )}
          {widen && (
            <Chip variant="tint" size="sm" onClick={() => setFilter(widen.key, undefined)} label={widen.label} className="max-md:min-h-11" />
          )}
        </div>
      </div>

      <TonightCards
        status={status}
        drawn={drawn}
        drawKey={seed ?? "today"}
        isDrawn={Boolean(seed)}
        isPick={isPick}
        animate={animate}
        className="md:flex-[1_1_440px] md:min-w-0"
      />
    </section>
  )
}

export default memo(TonightPanel)
