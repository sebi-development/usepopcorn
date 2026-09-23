
import formatRuntime from '@/utils/formatRuntime'
import Chip from '@/components/ui/Chip'

function DetailCard({ media }) {
  const isTV = media.type === 'tv'
  const director = !isTV ? media.credits?.crew?.find(c => c.job === 'Director')?.name : null;
  const network = isTV ? media.networks?.[0]?.name : null;

  return (
    <div className="[grid-area:info] flex flex-col gap-6">
      {/* Title */}
      <h1 className="text-4xl font-bold text-text leading-tight">
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
            {director && (
              <Chip
                size="sm"
                colorRgb="161, 161, 170"
                label={`Directed by ${director}`}
              />
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

export default DetailCard