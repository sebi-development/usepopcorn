import { useMemo } from 'react'
import { HiArrowDown, HiArrowUp } from 'react-icons/hi2'
import Tooltip from '@/components/ui/Tooltip'
import formatCurrency from '@/utils/formatCurrency'
import countryToFlag from '@/utils/countryToFlag'
import ProviderBadge from '@/features/media_details/components/ProviderBadge'

const SECTION_HEADER_CLASS = "text-sm font-semibold text-text-muted uppercase tracking-widest mb-3"

function formatDate(dateString) { if (!dateString) return null; return new Date(dateString).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }); }

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

function formatReleaseStatus(status) {
  if (!status) return null

  const UPCOMING_STATUSES = ['Post Production', 'In Production', 'Planned']

  if (UPCOMING_STATUSES.includes(status)) {
    return 'Upcoming'
  }
  return status
}

const BREAK_EVEN_MULTIPLE = 2.5
const THEATRICAL_RUN_MS = 90 * 24 * 60 * 60 * 1000

function formatRevenue({ budget, revenue, release_date }) {
  const formatted = formatCurrency(revenue)
  if (!formatted || !budget || !release_date || Date.now() - Date.parse(release_date) < THEATRICAL_RUN_MS) return formatted

  const multiple = Math.floor((revenue / budget) * 10) / 10
  const isHit = multiple >= BREAK_EVEN_MULTIPLE
  const Arrow = isHit ? HiArrowUp : HiArrowDown
  return (
    // inline-flex shrink-wraps Tooltip's block wrapper, so the tip centres on the figure
    <span className="inline-flex">
      <Tooltip side='right' label={`${isHit ? 'Hit' : 'Flop'}: ${multiple}× its budget (break-even ~${BREAK_EVEN_MULTIPLE}×)`}>
        <span className="flex items-center gap-1 cursor-help">
          {formatted}
          <Arrow size={14} aria-hidden="true" className={isHit ? 'text-success' : 'text-danger'} />
        </span>
      </Tooltip>
    </span>
  )
}

export default function OverviewTab({ data }) {
  const isTV = data?.type === 'tv'

  const activeInfoItems = useMemo(() => {
    const formattedCountries = data?.origin_country
      ?.map((code) => {
        const flag = countryToFlag(code)
        try {
          const countryName = regionNames.of(code);
          return flag ? `${countryName} (${flag})` : countryName;
        } catch {
          return flag ? `${flag} ${code}` : code;
        }
      })
      .join(', ')

    return [
      { label: 'Status', value: formatReleaseStatus(data?.release_status) },
      isTV ? { label: 'First Aired', value: formatDate(data?.first_air_date) } : { label: 'Release Date', value: formatDate(data?.release_date) },
      isTV && { label: 'Last Aired', value: formatDate(data?.last_air_date) },
      isTV && { label: 'Seasons', value: data?.number_of_seasons },
      isTV && { label: 'Episodes', value: data?.number_of_episodes },
      { label: 'Rating', value: data?.certification || 'NR' },
      (!isTV && data?.regionalReleaseDate && data.regionalReleaseDate !== data.release_date) ? { label: 'Local Release', value: formatDate(data?.regionalReleaseDate) } : null,
      !isTV && { label: 'Budget', value: formatCurrency(data?.budget) },
      !isTV && { label: 'Revenue', value: formatRevenue(data ?? {}) },
      { label: 'Country', value: formattedCountries || null },
      { label: 'Content', value: data?.explicit ? '🔞 Adult Content' : null }
    ].filter((item) => item && item.value != null);
  }, [data, isTV])

  return (
    <div className="flex flex-col gap-6">

      {/* About Section */}
      <div>
        <h3 className={SECTION_HEADER_CLASS}>About</h3>
        <p className="text-text text-sm leading-relaxed">
          {data?.overview || "No overview available."}
        </p>
      </div>

      {/* Additional Info Section */}
      {activeInfoItems.length > 0 && (
        <div>
          <h3 className={SECTION_HEADER_CLASS}>Additional Information</h3>
          <div className="flex flex-col">
            {activeInfoItems.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[6.5rem_minmax(0,1fr)] sm:grid-cols-[120px_minmax(0,1fr)] py-3 border-b border-surface-100/30 last:border-0"
              >
                <span className="text-sm text-white/40">{item.label}</span>
                <span className="text-sm text-text font-medium wrap-break-word">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streaming Providers Section */}
      <div>
        <h3 className={`${SECTION_HEADER_CLASS} mt-6`}>Streaming Availability</h3>
        {data?.providers?.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {data.providers.map((provider) => (
              <ProviderBadge key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">None of the major streaming platforms currently has this title.</p>
        )}
      </div>
    </div>
  )
}