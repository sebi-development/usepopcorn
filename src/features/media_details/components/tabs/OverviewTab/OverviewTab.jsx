import { HiArrowDown, HiArrowUp } from 'react-icons/hi2'
import Tooltip from '@/components/ui/Tooltip'
import Collapsible from '@/features/media_details/components/tabs/OverviewTab/Collapsible'
import StreamingProviders from '@/features/media_details/components/tabs/OverviewTab/StreamingProviders'
import { BREAK_EVEN_MULTIPLE, toOverviewFacts } from '@/features/media_details/components/tabs/OverviewTab/overviewFacts'

function Revenue({ text, verdict: { multiple, isHit } }) {
  const Arrow = isHit ? HiArrowUp : HiArrowDown
  return (
    // inline-flex shrink-wraps Tooltip's block wrapper, so the tip centres on the figure
    <span className="inline-flex">
      <Tooltip side='top' label={`${isHit ? 'Hit' : 'Flop'}: ${multiple}× its budget (break-even ~${BREAK_EVEN_MULTIPLE}×)`}>
        <span className="flex items-center gap-1 cursor-help">
          {text}
          <Arrow size={14} aria-hidden="true" className={isHit ? 'text-success' : 'text-danger'} />
        </span>
      </Tooltip>
    </span>
  )
}

// Rendered inside its Collapsible, so the facts are worked out only once the section opens
function FactColumns({ data }) {
  return (
    <div className="grid grid-cols-2 gap-x-6">
      {toOverviewFacts(data).map((column, index) => (
        <dl key={index} className="flex min-w-0 flex-col gap-4">
          {column.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs text-text-muted">{fact.label}</dt>
              <dd className="mt-0.5 text-sm text-text font-medium wrap-break-word">
                {fact.verdict ? <Revenue text={fact.value} verdict={fact.verdict} /> : fact.value}
              </dd>
            </div>
          ))}
        </dl>
      ))}
    </div>
  )
}

export default function OverviewTab({ data }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="heading-group mb-3">About</h2>
        <p className="text-text text-sm leading-relaxed">
          {data.overview || "No overview available."}
        </p>
      </div>

      <div>
        <Collapsible title="Additional Information">
          <FactColumns data={data} />
        </Collapsible>

        <Collapsible title="Streaming Availability">
          <StreamingProviders media={data} />
        </Collapsible>
      </div>
    </div>
  )
}
