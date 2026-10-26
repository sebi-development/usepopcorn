import { memo } from "react"
import MediaRow from "@/components/media/MediaRow"
import PersonCard from "@/components/media/PersonCard"
import useTvCast from "@/features/media_details/hooks/useTvCast"

const renderPerson = (person) => (
  <PersonCard
    id={person.id}
    name={person.name}
    character={person.character}
    profilePath={person.profile_path}
    episodes={person.episodes}
  />
)

// Lazy-loaded tab. A movie's cast comes with its details; a series' is fetched on the tab's first open.
function CastTab({ media, tmdbId, type }) {
  const isTv = type === 'tv'
  const tvCast = useTvCast(isTv ? tmdbId : null)
  const cast = isTv ? tvCast.data : media.cast

  if (cast?.length === 0) return <p className="text-sm text-text-muted md:px-6">No cast information yet.</p>

  return (
    <MediaRow
      data={cast}
      isLoading={tvCast.isLoading}
      isError={!!tvCast.error}
      delaySkeleton
      renderItem={renderPerson}
      rank={false}
    />
  )
}

export default memo(CastTab)
