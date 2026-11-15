import SkeletonBox from '@/components/ui/SkeletonBox'
import Tooltip from '@/components/ui/Tooltip'
import getTmdbImageUrl from '@/utils/tmdbImage'

// Shared with the skeleton, so the badges land where their placeholders were
const COLUMN_CLASS = "flex w-12 flex-col items-center gap-1.5"
const TILE_SHAPE = "size-12 rounded-xl"

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

export function ProviderBadgeSkeleton() {
  return (
    <div className={COLUMN_CLASS}>
      <SkeletonBox className={TILE_SHAPE} />
      <SkeletonBox className="hidden pointer-coarse:block h-3 w-10 rounded-full" />
    </div>
  )
}

export default function ProviderBadge({ provider, title }) {
  const { name, logoPath, href, kind } = provider
  const logo = (
    <img
      src={getTmdbImageUrl(logoPath, 'w92')}
      alt={href ? '' : name}
      width={48}
      height={48}
      loading="lazy"
      decoding="async"
      className={`${TILE_SHAPE} bg-surface-100 object-cover ring-1 ring-white/10`}
    />
  )

  return (
    <div className={COLUMN_CLASS}>
      <Tooltip label={href ? `${TIPS[kind]} ${name}` : name} side="bottom">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={LABELS[kind](title, name)}
            className="block rounded-xl outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary-light/60"
          >
            {logo}
          </a>
        ) : logo}
      </Tooltip>
      <span className="hidden w-16 text-center text-[11px] leading-tight text-text-muted line-clamp-2 pointer-coarse:block">
        {name}
      </span>
    </div>
  )
}
