import Tooltip from '@/components/ui/Tooltip'
import getTmdbImageUrl from '@/utils/tmdbImage'

// TMDB's own app icon for every service, so the row is one uniform set (w92 covers the 48px tile on retina).
// Hover names the service; touch has no hover, so there the name sits under the tile.
export default function ProviderBadge({ provider }) {
  return (
    <div className="flex w-12 flex-col items-center gap-1.5">
      <Tooltip label={provider.name} side="bottom">
        <img
          src={getTmdbImageUrl(provider.logoPath, 'w92')}
          alt={provider.name}
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
          className="size-12 rounded-xl bg-surface-100 object-cover ring-1 ring-white/10"
        />
      </Tooltip>
      <span className="hidden w-16 text-center text-[11px] leading-tight text-text-muted line-clamp-2 pointer-coarse:block">
        {provider.name}
      </span>
    </div>
  )
}
