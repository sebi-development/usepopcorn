import { useLayoutEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
import { differenceInYears, format, parseISO } from "date-fns"

import usePerson from "@/features/people/hooks/usePerson"
import useMediaState from "@/features/interactions/hooks/useMediaState"
import Filmography from "@/features/people/components/Filmography"
import MoviePoster from "@/components/media/MoviePoster"
import RatingBadge from "@/components/media/RatingBadge"
import AlertBanner from "@/components/ui/AlertBanner"
import Chip from "@/components/ui/Chip"
import SkeletonBox from "@/components/ui/SkeletonBox"
import getTmdbImageUrl from "@/utils/tmdbImage"

// md:px-6 lines the header up with the rows below (MediaRow and FilterBar are inset the same)
const GRID_CLASS = "grid grid-cols-[6.5rem_minmax(0,1fr)] md:grid-cols-[min(300px,30%)_minmax(0,1fr)] gap-4 md:gap-8 md:px-6 items-start"
const META_CHIP_COLOR = "161, 161, 170"
// The text links are 20px tall: an invisible ::before pads the tap area to 44px without moving anything
const TAP_AREA = "relative before:absolute before:-inset-3"
// A longer bio is clamped behind "More"
const BIO_CLAMP_CHARS = 400

const formatDay = (day) => format(parseISO(day), 'MMM d, yyyy')

function lifeLabel({ birthday, deathday }) {
  if (!birthday) return null
  const age = differenceInYears(deathday ? parseISO(deathday) : new Date(), parseISO(birthday))
  return deathday
    ? `${formatDay(birthday)} – ${formatDay(deathday)} (${age})`
    : `Born ${formatDay(birthday)} (${age})`
}

// The signed-in user's ratings and watchlist over this person's titles, from the cached media state
function useHistory(person) {
  const { ratings, watchlist } = useMediaState()
  return useMemo(() => {
    if (!person) return null
    const ids = [...new Set([...person.acting, ...person.directing].map((c) => c.id))]
    const scores = ids.map((id) => ratings.get(id)).filter(Boolean)
    return {
      rated: scores.length,
      average: scores.length ? (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1) : null,
      watchlisted: ids.filter((id) => watchlist.has(id)).length,
    }
  }, [person, ratings, watchlist])
}

function PersonSkeleton() {
  return (
    <div className={`${GRID_CLASS} delayed-reveal`}>
      <SkeletonBox className="w-full aspect-2/3 rounded-card" />
      <div className="flex flex-col gap-4">
        <SkeletonBox className="h-10 w-3/4 rounded-lg" />
        <SkeletonBox className="h-6 w-1/2 rounded-full" />
      </div>
    </div>
  )
}

export default function PersonPage() {
  const { id } = useParams()
  const personId = Number(id)
  const [bioOpen, setBioOpen] = useState(false)

  // Open each person at the top, as DetailPage does
  useLayoutEffect(() => {
    history.scrollRestoration = "manual"
    window.scrollTo(0, 0)
    return () => { history.scrollRestoration = "auto" }
  }, [personId])

  const { data: person, isLoading, error } = usePerson(personId)
  const historyStats = useHistory(person)

  if (isLoading) return <PersonSkeleton />
  if (error) return <AlertBanner message='Error fetching data. Please try again' variant="danger" />
  if (!person) return null

  const life = lifeLabel(person)
  const longBio = person.biography?.length > BIO_CLAMP_CHARS

  return (
    <main className="flex flex-col gap-8 md:gap-14 pb-12">
      <div className={GRID_CLASS}>
        <MoviePoster
          src={getTmdbImageUrl(person.profile_path, 'h632')}
          srcSet={person.profile_path && `${getTmdbImageUrl(person.profile_path, 'w185')} 185w, ${getTmdbImageUrl(person.profile_path, 'h632')} 421w`}
          sizes="(min-width: 768px) 300px, 6.5rem"
          alt={person.name}
          className="w-full aspect-2/3 rounded-card"
          priority
        />

        <div className="flex flex-col gap-3 md:gap-6 min-w-0">
          <h1 className="text-xl md:text-4xl font-bold text-text leading-tight break-words">{person.name}</h1>

          <div className="flex flex-wrap items-center gap-2">
            {person.known_for_department && <Chip size="sm" colorRgb={META_CHIP_COLOR} label={person.known_for_department} />}
            {life && <Chip size="sm" colorRgb={META_CHIP_COLOR} label={life} />}
            {person.place_of_birth && <Chip size="sm" colorRgb={META_CHIP_COLOR} label={person.place_of_birth} />}
          </div>

          {(historyStats.rated > 0 || historyStats.watchlisted > 0) && (
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-text-muted">
              {historyStats.rated > 0 && (
                <>
                  <span>You rated {historyStats.rated} of their titles</span>
                  <RatingBadge text={`avg ${historyStats.average}`} size={14} />
                </>
              )}
              {historyStats.watchlisted > 0 && <span>· {historyStats.watchlisted} on your watchlist</span>}
            </div>
          )}

          {person.biography && (
            <div>
              <p className={`text-sm text-text leading-relaxed whitespace-pre-line ${bioOpen ? '' : 'line-clamp-5'}`}>
                {person.biography}
              </p>
              {longBio && (
                <button type="button" onClick={() => setBioOpen((v) => !v)} className={`${TAP_AREA} mt-1 text-sm font-medium text-primary-light hover:text-text cursor-pointer`}>
                  {bioOpen ? 'Less' : 'More'}
                </button>
              )}
            </div>
          )}

          {person.imdb_id && (
            <a
              href={`https://www.imdb.com/name/${person.imdb_id}/`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${TAP_AREA} self-start text-sm font-medium text-text-muted hover:text-text`}
            >
              IMDb ↗
            </a>
          )}
        </div>
      </div>

      <Filmography key={person.id} person={person} />
    </main>
  )
}
