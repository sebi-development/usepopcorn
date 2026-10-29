import { Fragment, memo } from 'react'
import { Link } from 'react-router'
import formatRuntime from '@/utils/formatRuntime'
import Chip from '@/components/ui/Chip'

// The name links are 10px tall: an invisible ::before pads each tap area vertically
const NAME_LINK_CLASS = "relative before:absolute before:-inset-y-2.5 before:inset-x-0 hover:underline underline-offset-2"
// "Joe Russo & Anthony Russo", "A, B & C"
const separatorAt = (index, count) => (index === 0 ? '' : index === count - 1 ? ' & ' : ', ')

function DetailCard({ media }) {
  const isTV = media.type === 'tv'
  const { directors = [], network } = media

  return (
    <div className="[grid-area:info] flex flex-col gap-3 md:gap-6">
      {/* Title */}
      <h1 className="text-xl md:text-4xl font-bold text-text leading-tight break-words">
        {media.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2">
        {isTV ? (
          <>
            {network && (
              <Chip
                size="sm"
                colorRgb="161, 161, 170"
                label={network}
              />
            )}
            <Chip
              size="sm"
              colorRgb="161, 161, 170"
              label={`${media.first_air_date?.slice(0, 4) || ''}${media.last_air_date ? ` – ${media.last_air_date.slice(0, 4)}` : ''}`}
            />
            <Chip
              size="sm"
              colorRgb="161, 161, 170"
              label={`${media.number_of_seasons} ${media.number_of_seasons === 1 ? 'Season' : 'Seasons'} · ${media.number_of_episodes} Episodes`}
            />
          </>
        ) : (
          <>
            <Chip
              size="sm"
              colorRgb="161, 161, 170"
              label={media.release_date?.slice(0, 4) || 'TBA'}
            />
            {media.runtime !== 0 && media.runtime != null && (
              <Chip
                size="sm"
                colorRgb="161, 161, 170"
                label={formatRuntime(media.runtime)}
              />
            )}
            {directors.length > 0 && (
              <Chip size="sm" colorRgb="161, 161, 170">
                <span className="mt-[1px]">
                  Directed by{' '}
                  {directors.map((d, i) => (
                    <Fragment key={d.id}>
                      {separatorAt(i, directors.length)}
                      <Link to={`/person/${d.id}`} className={NAME_LINK_CLASS}>{d.name}</Link>
                    </Fragment>
                  ))}
                </span>
              </Chip>
            )}
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

export default memo(DetailCard)