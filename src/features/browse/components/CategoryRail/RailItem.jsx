import { HiChevronRight } from "react-icons/hi2"
import { rowClass } from "@/features/browse/components/CategoryRail/rail"

// One rail row. The label shrinks to nothing on the collapsed rail (the chevron lands just outside its
// clip), so expanding animates the rail's width only and no row runs a transition of its own.
// With `isOpen` the row toggles a fold and shows a chevron.
export default function RailItem({ icon: Icon, label, isActive = false, isOpen, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      aria-expanded={isOpen}
      className={`flex items-center w-full h-11 md:h-8 ${rowClass(isActive)}`}
    >
      <span className="flex items-center justify-center w-8 h-full shrink-0">
        <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
      </span>
      <span className="flex-1 min-w-0 pl-1 overflow-hidden whitespace-nowrap text-sm text-left">{label}</span>
      {isOpen !== undefined && (
        <span className={`flex items-center justify-center w-6 mr-1 shrink-0 transition-transform duration-300 ease-out-quint motion-reduce:transition-none ${isOpen ? "rotate-90" : ""}`}>
          <HiChevronRight size={16} />
        </span>
      )}
    </button>
  )
}
