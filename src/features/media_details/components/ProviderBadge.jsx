import Tooltip from '@/components/ui/Tooltip'
import getTmdbImageUrl from '@/utils/tmdbImage'

const TILE_CLASS = "size-12 rounded-xl bg-surface-100 object-cover ring-1 ring-white/10"

// TMDB's own app icon for every service, so the row is one uniform set (w92 covers the 48px tile on retina).
// Hover names the service; touch has no hover, so there the name sits under the tile.
// `href` opens the title on the service, a search there or TMDB's where-to-watch page (`kind`, from
// streamingLink); without it the tile is a plain logo.
const TIPS = { title: 'Watch on', search: 'Search on', where: 'Where to watch on' }
const LABELS = {
  title: (title, name) => `Watch ${title} on ${name}`,
  search: (title, name) => `Search for ${title} on ${name}`,
  where: (title, name) => `Where to watch ${title} on ${name}`,
}

export default function ProviderBadge({ provider, title, href, kind }) {
  const logo = (
    <img
      src={getTmdbImageUrl(provider.logoPath, 'w92')}
      alt={href ? '' : provider.name}
      width={48}
      height={48}
      loading="lazy"
      decoding="async"
      className={TILE_CLASS}
    />
  )

  return (
    <div className="flex w-12 flex-col items-center gap-1.5">
      <Tooltip label={href ? `${TIPS[kind]} ${provider.name}` : provider.name} side="bottom">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={LABELS[kind](title, provider.name)}
            className="block rounded-xl outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary-light/60"
          >
            {logo}
          </a>
        ) : logo}
      </Tooltip>
      <span className="hidden w-16 text-center text-[11px] leading-tight text-text-muted line-clamp-2 pointer-coarse:block">
        {provider.name}
      </span>
    </div>
  )
}
