import { memo } from "react"
import { Link } from "react-router"
import MoviePoster from "@/components/media/MoviePoster"
import getTmdbImageUrl from "@/utils/tmdbImage"

// A cast or crew member in a MediaRow (see CastTab). w185 only: ~11 KB a photo, h632 would be ~4x that.
// `linked={false}` for someone PersonPage can't show: it lists acting and directing credits only.
function PersonCard({ id, name, character, profilePath, episodes, linked = true }) {
  const body = (
    <>
      <MoviePoster
        src={getTmdbImageUrl(profilePath, 'w185')}
        alt={name}
        className="w-full aspect-2/3 rounded-card group-hover/card:scale-105 transition-transform duration-300"
      />
      <p className="mt-2 text-sm font-semibold text-text line-clamp-2">{name}</p>
      {character && <p className="text-xs text-text-muted line-clamp-1">{character}</p>}
      {episodes > 0 && <p className="text-xs text-text-muted">{episodes} eps</p>}
    </>
  )

  // Without `group/card` the poster's hover zoom stays off, so an unlinked card doesn't look clickable
  return linked ? <Link to={`/person/${id}`} className="group/card block">{body}</Link> : <div>{body}</div>
}

export default memo(PersonCard)
