import { useMemo } from 'react'
import formatCurrency from '../../../../utils/formatCurrency'
import countryToFlag from '../../../../utils/countryToFlag'
import ProviderBadge from '../ProviderBadge'

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

export default function OverviewTab({ data }) {
  const isTV = data?.type === 'tv'

  // Format origin country array into "🇺🇸 US" format
  const formattedCountries = data?.origin_country
    ?.map((code) => {
      const flag = countryToFlag(code)
      try {
        const countryName = regionNames.of(code);
        return flag ? ` ${countryName} ( ${flag} )` : countryName;
      } catch (e) {
        console.warn(e.message)
        return flag ? `${flag} ${code}` : code;
        
      }
    })
    .join(', ')

  const infoItems = useMemo(() => {
    return [
      { label: 'Status', value: formatReleaseStatus(data?.release_status) },
      isTV ? { label: 'First Aired', value: formatDate(data?.first_air_date) } : { label: 'Release Date', value: formatDate(data?.release_date) },
      isTV && { label: 'Last Aired', value: formatDate(data?.last_air_date) },
      isTV && { label: 'Seasons', value: data?.number_of_seasons },
      isTV && { label: 'Episodes', value: data?.number_of_episodes },
      { label: 'Rating', value: data?.certification || 'NR' },
      (!isTV && data?.regionalReleaseDate && data.regionalReleaseDate !== data.release_date) ? { label: 'Local Release', value: formatDate(data?.regionalReleaseDate) } : null,
      !isTV && { label: 'Budget', value: formatCurrency(data?.budget) },
      !isTV && { label: 'Revenue', value: formatCurrency(data?.revenue) },
      { label: 'Country', value: formattedCountries || null },
      { label: 'Content', value: data?.explicit ? '🔞 Adult Content' : null }
    ].filter(Boolean);
  }, [data, formattedCountries, isTV])

  const activeInfoItems = useMemo(() => {
    return infoItems.filter((item) => item.value !== null && item.value !== undefined)
  }, [infoItems])

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
                className="grid grid-cols-[120px_1fr] py-3 border-b border-surface-100/30 last:border-0"
              >
                <span className="text-sm text-white/40">{item.label}</span>
                <span className="text-sm text-text font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streaming Providers Section */}
      <div>
        <h3 className="text-sm font-bold tracking-wider text-text-muted uppercase mb-3 mt-6">Streaming Availability</h3>
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