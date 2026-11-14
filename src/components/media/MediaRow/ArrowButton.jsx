import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

// The row's round chevron button, for the scroll arrows and the page arrows (`className` sizes and places it)
export default function ArrowButton({ direction, className = "", ...props }) {
  const Icon = direction === "left" ? FiChevronLeft : FiChevronRight
  return (
    <button
      type="button"
      className={`flex items-center justify-center rounded-full bg-surface-900/80 backdrop-blur border border-surface-100/40 text-text-muted hover:scale-110 hover:bg-surface-800 transition-all duration-200 ${className}`}
      {...props}
    >
      <Icon size={16} />
    </button>
  )
}
