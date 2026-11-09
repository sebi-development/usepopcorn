import { memo, useMemo } from "react"
import MediaRow from "@/components/media/MediaRow"
import PersonCard from "@/components/media/PersonCard"
import useTvCredits from "@/features/media_details/hooks/useTvCredits"
import { toCrewCards } from "@/utils/tmdbPerson"

const renderPerson = (person) => (
  <PersonCard
    id={person.id}
    name={person.name}
    character={person.character}
    profilePath={person.profile_path}
    episodes={person.episodes}
  />
)

// Only heads (directors, creators) open PersonPage; they come first, so their jobs start with the head job
const LINKED_JOBS = ['Director', 'Creator']
const renderCrew = (person) => (
  <PersonCard
    id={person.id}
    name={person.name}
    character={person.jobs.join(', ')}
    profilePath={person.profile_path}
    linked={LINKED_JOBS.includes(person.jobs[0])}
  />
)

// Lazy-loaded tab. A movie's cast and crew come with its details; a series' are fetched on the tab's first open.
function CastTab({ media, tmdbId, type }) {
  const isTv = type === 'tv'
  const tvCredits = useTvCredits(isTv ? tmdbId : null)
  const { cast, crew } = (isTv ? tvCredits.data : media) ?? {}
  const crewCards = useMemo(
    () => crew && toCrewCards(isTv ? media.creators : media.directors, isTv ? 'Creator' : 'Director', crew),
    [crew, isTv, media]
  )

  if (cast?.length === 0 && !crewCards?.length) return <p className="text-sm text-text-muted md:px-6">No cast information yet.</p>

  // The crew row appears with the loaded data, below the cast: nothing above it moves
  return (
    <div className="flex flex-col gap-6 md:gap-10">
      {cast?.length !== 0 && (
        <MediaRow
          heading="Cast"
          data={cast}
          isLoading={tvCredits.isLoading}
          isError={!!tvCredits.error}
          delaySkeleton
          renderItem={renderPerson}
          rank={false}
        />
      )}
      {crewCards?.length > 0 && <MediaRow heading="Crew" data={crewCards} renderItem={renderCrew} rank={false} />}
    </div>
  )
}

export default memo(CastTab)
