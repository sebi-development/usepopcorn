import { useMemo, useState } from 'react'
import { HiArrowDown, HiArrowUp, HiChevronDown } from 'react-icons/hi2'
import Tooltip from '@/components/ui/Tooltip'
import formatCurrency from '@/utils/formatCurrency'
import countryToFlag from '@/utils/countryToFlag'
import ProviderBadge from '@/features/media_details/components/ProviderBadge'
import InfoNote from '@/components/ui/InfoNote'

const SECTION_HEADER_CLASS = "text-sm font-semibold uppercase tracking-widest"

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
      <Tooltip side='top' label={`${isHit ? 'Hit' : 'Flop'}: ${multiple}× its budget (break-even ~${BREAK_EVEN_MULTIPLE}×)`}>
        <span className="flex items-center gap-1 cursor-help">
          {formatted}
          <Arrow size={14} aria-hidden="true" className={isHit ? 'text-success' : 'text-danger'} />
        </span>
      </Tooltip>
    </span>
  )
}

// Closed until clicked, so a section's content (and its images) mounts only on demand
function Collapsible({ title, children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-t border-surface-100">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-light/60"
      >
        <span className={`${SECTION_HEADER_CLASS} text-text-muted transition-colors group-hover:text-text`}>{title}</span>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-900/70 text-text-muted">
          <HiChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`} />
        </span>
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  )
}

export default function OverviewTab({ data }) {
  const isTV = data?.type === 'tv'

  const { left, right } = useMemo(() => {
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

    const present = (items) => items.filter((item) => item && item.value != null)

    return {
      left: present([
        { label: 'Status', value: formatReleaseStatus(data?.release_status) },
        isTV ? { label: 'First Aired', value: formatDate(data?.first_air_date) } : { label: 'Release Date', value: formatDate(data?.release_date) },
        isTV && { label: 'Last Aired', value: formatDate(data?.last_air_date) },
        { label: 'Rating', value: data?.certification || 'NR' },
        (!isTV && data?.regionalReleaseDate && data.regionalReleaseDate !== data.release_date) && { label: 'Local Release', value: formatDate(data?.regionalReleaseDate) },
        { label: 'Country', value: formattedCountries || null },
      ]),
      right: present([
        isTV && { label: 'Seasons', value: data?.number_of_seasons },
        isTV && { label: 'Episodes', value: data?.number_of_episodes },
        !isTV && { label: 'Budget', value: formatCurrency(data?.budget) },
        !isTV && { label: 'Revenue', value: formatRevenue(data ?? {}) },
        { label: 'Content', value: data?.explicit ? '🔞 Adult Content' : null },
      ]),
    }
  }, [data, isTV])

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h2 className={`${SECTION_HEADER_CLASS} mb-3 text-text-muted`}>About</h2>
        <p className="text-text text-sm leading-relaxed">
          {data?.overview || "No overview available."}
        </p>
      </div>

      <div>
        <Collapsible title="Additional Information">
          <div className="grid grid-cols-2 gap-x-6">
            {[left, right].map((column, index) => (
              <dl key={index} className="flex min-w-0 flex-col gap-4">
                {column.map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs text-text-muted">{item.label}</dt>
                    <dd className="mt-0.5 text-sm text-text font-medium wrap-break-word">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>
        </Collapsible>

        <Collapsible title="Streaming Availability">
          {data?.providers?.length > 0 ? (
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {data.providers.map((provider) => (
                <ProviderBadge key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <InfoNote>None of the major streaming platforms currently has this title.</InfoNote>
          )}
        </Collapsible>
      </div>
    </div>
  )
}
