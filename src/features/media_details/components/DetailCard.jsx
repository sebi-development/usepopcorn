import { FiCalendar, FiClock, FiTv, FiFilm } from 'react-icons/fi'
import formatRuntime from '../../../utils/formatRuntime'
import Chip from '../../../components/Chip'

function DetailCard({ media }) {
  const isTV = media.type === 'tv'

  return (
    <div className="[grid-area:info] flex flex-col gap-6">

      {/* Title */}
      <h1 className="text-4xl font-bold text-text leading-tight">
        {media.title}
      </h1>

      {/* Meta */}
      <div className="flex items-center gap-4 text-text-muted text-sm">
        {isTV ? (
          <>
            <span className="flex items-center gap-1.5">
              <FiCalendar size={14} />
              {media.first_air_date?.slice(0, 4)}
              {media.last_air_date && ` – ${media.last_air_date.slice(0, 4)}`}
            </span>
            <span className="text-surface-100">•</span>
            <span className="flex items-center gap-1.5">
              <FiTv size={14} />
              {media.number_of_seasons} {media.number_of_seasons === 1 ? 'Season' : 'Seasons'} · {media.number_of_episodes} Episodes
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5">
              <FiCalendar size={14} />
              {media.release_date?.slice(0, 4)}
            </span>
            <span className="text-surface-100">•</span>
            <span className="flex items-center gap-1.5">
              <FiClock size={14} />
              {formatRuntime(media.runtime)}
            </span>
          </>
        )}
      </div>

      {/* Genres */}
      <div className="flex flex-wrap gap-2">
        {/* Dynamic Genres */}
        {media?.genres && media.genres.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {media.genres.map((genre) => (
              <Chip
                key={genre.id}
                label={genre.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DetailCard