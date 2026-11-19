import { useState } from 'react'
import { HiChevronDown } from 'react-icons/hi2'

// Closed until clicked, so a section's content (and its images) mounts only on demand
export default function Collapsible({ title, children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-t border-surface-100">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-light/60"
      >
        <span className="heading-group text-text-muted transition-colors group-hover:text-text">{title}</span>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-900/70 text-text-muted">
          <HiChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`} />
        </span>
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  )
}
