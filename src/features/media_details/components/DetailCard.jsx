import { Fragment, memo } from 'react'
import { Link } from 'react-router'
import formatRuntime from '@/utils/formatRuntime'
import Chip from '@/components/ui/Chip'

// The name links are 10px tall: an invisible ::before pads each tap area vertically
const NAME_LINK_CLASS = "relative text-text font-medium before:absolute before:-inset-y-2.5 before:inset-x-0 hover:underline underline-offset-2"
// "Joe Russo & Anthony Russo", "A, B & C"
const separatorAt = (index, count) => (index === 0 ? '' : index === count - 1 ? ' & ' : ', ')

function DetailCard({ media }) {
  const isTV = media.type === 'tv'
  const { directors = [], network, genres } = media

  const facts = isTV
    ? [
      network,
      `${media.first_air_date?.slice(0, 4) || ''}${media.last_air_date ? ` – ${media.last_air_date.slice(0, 4)}` : ''}`,
      `${media.number_of_seasons} ${media.number_of_seasons === 1 ? 'Season' : 'Seasons'}`,
      `${media.number_of_episodes} Episodes`,
    ]
    : [media.release_date?.slice(0, 4) || 'TBA', media.runtime ? formatRuntime(media.runtime) : null]

  return (
    <div className="flex flex-col gap-2.5 md:gap-4">
      <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-text leading-[1.05] tracking-tight break-words">
        {media.title}
      </h1>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] md:text-sm text-text-muted">
        {facts.filter(Boolean).map((fact, i) => (
          <Fragment key={fact}>
            {i > 0 && <span aria-hidden="true">·</span>}
            <span>{fact}</span>
          </Fragment>
        ))}
        {directors.length > 0 && (
          <>
            {/* On phones the director gets its own line, so no separator dangles at the wrap */}
            <span aria-hidden="true" className="max-md:hidden">·</span>
            <span className="max-md:basis-full">
              Directed by{' '}
              {directors.map((d, i) => (
                <Fragment key={d.id}>
                  {separatorAt(i, directors.length)}
                  <Link to={`/person/${d.id}`} className={NAME_LINK_CLASS}>{d.name}</Link>
                </Fragment>
              ))}
            </span>
          </>
        )}
      </p>

      {genres?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 md:mt-1">
          {genres.map((genre) => (
            <Chip key={genre.id} variant="tint" size="sm" label={genre.name} />
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(DetailCard)
