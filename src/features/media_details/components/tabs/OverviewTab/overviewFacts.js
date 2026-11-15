import { formatDay } from '@/utils/tmdbItem'

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const UPCOMING_STATUSES = ['Post Production', 'In Production', 'Planned']
const THEATRICAL_RUN_MS = 90 * 24 * 60 * 60 * 1000
export const BREAK_EVEN_MULTIPLE = 2.5

export const regionName = (code) => (code ? regionNames.of(code) : null)
const formatCurrency = (amount) => (amount ? usd.format(amount) : null)

// DisplayNames throws on a malformed code, which then shows as given
function countryName(code) {
  try {
    return regionNames.of(code)
  } catch {
    return code
  }
}

// Judged once the theatrical run is over: revenue as a multiple of the budget
function revenueVerdict({ budget, revenue, release_date }) {
  if (!revenue || !budget || !release_date || Date.now() - Date.parse(release_date) < THEATRICAL_RUN_MS) return null
  const multiple = Math.floor((revenue / budget) * 10) / 10
  return { multiple, isHit: multiple >= BREAK_EVEN_MULTIPLE }
}

const present = (facts) => facts.filter((fact) => fact && fact.value != null)

// The two columns of "Additional Information", without the facts the title has no value for
export function toOverviewFacts(data) {
  const isTV = data.type === 'tv'
  const hasLocalRelease = !isTV && data.regionalReleaseDate && data.regionalReleaseDate !== data.release_date

  return [
    present([
      { label: 'Status', value: UPCOMING_STATUSES.includes(data.release_status) ? 'Upcoming' : data.release_status },
      isTV ? { label: 'First Aired', value: formatDay(data.first_air_date) } : { label: 'Release Date', value: formatDay(data.release_date) },
      isTV && { label: 'Last Aired', value: formatDay(data.last_air_date) },
      { label: 'Rating', value: data.certification || 'NR' },
      hasLocalRelease && { label: 'Local Release', value: formatDay(data.regionalReleaseDate) },
      { label: 'Country', value: data.origin_country?.map(countryName).join(', ') || null },
    ]),
    present([
      isTV && { label: 'Seasons', value: data.number_of_seasons },
      isTV && { label: 'Episodes', value: data.number_of_episodes },
      !isTV && { label: 'Budget', value: formatCurrency(data.budget) },
      !isTV && { label: 'Revenue', value: formatCurrency(data.revenue), verdict: revenueVerdict(data) },
      { label: 'Content', value: data.explicit ? '🔞 Adult Content' : null },
    ]),
  ]
}
