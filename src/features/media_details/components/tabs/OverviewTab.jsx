import formatCurrency from '../../../../utils/formatCurrency'
import countryToFlag from '../../../../utils/countryToFlag'

const SECTION_HEADER_CLASS = "text-sm font-semibold text-text-muted uppercase tracking-widest mb-3"

function formatReleaseStatus(status) {
  if (!status) return null

  const UPCOMING_STATUSES = ['Post Production', 'In Production', 'Planned']

  if (UPCOMING_STATUSES.includes(status)) {
    return 'Upcoming'
  }

  return status
}

export default function OverviewTab({ data }) {
  // Format origin country array into "🇺🇸 US" format
  const formattedCountries = data?.origin_country
    ?.map((code) => {
      const flag = countryToFlag(code)
      return flag ? `${flag} ${code}` : code
    })
    .join(', ')

  const infoItems = [
    { label: 'Status', value: formatReleaseStatus(data?.release_status) },
    { label: 'Release Date', value: data?.release_date ? new Date(data.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null },
    { label: 'Budget', value: formatCurrency(data?.budget) },
    { label: 'Revenue', value: formatCurrency(data?.revenue) },
    { label: 'Country', value: formattedCountries || null },
    { label: 'Content', value: data?.explicit ? '🔞 Adult Content' : null }
  ]

  const activeInfoItems = infoItems.filter((item) => item.value !== null && item.value !== undefined)

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

      {/* Streaming Info Section */}
      <div>
        <h3 className={SECTION_HEADER_CLASS}>Streaming availability</h3>
        <p className="text-text text-sm leading-relaxed">
          COMING SOON
        </p>
      </div>
    </div>
  )
}