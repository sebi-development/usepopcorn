import { RiInformationLine } from "react-icons/ri"

// A quiet outlined note: a rule, a caveat or an empty state
export default function InfoNote({ children, className = "" }) {
  return (
    <div className={`flex items-start gap-2 rounded-lg border border-surface-100/60 px-2.5 py-1 text-[11px] leading-snug text-text-muted ${className}`}>
      <RiInformationLine size={13} className="mt-px shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  )
}
