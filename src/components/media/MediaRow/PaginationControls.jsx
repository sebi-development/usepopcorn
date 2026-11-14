import Chip from "@/components/ui/Chip"
import ArrowButton from "@/components/media/MediaRow/ArrowButton"

const PAGE_ARROW_CLASS = "w-11 h-11 md:w-8 md:h-8 disabled:opacity-30 disabled:pointer-events-none"

// Numbered pages under a grid; changing page scrolls back to the top of the row
export default function PaginationControls({ page, totalPages, onPageChange, isPending, containerRef }) {
  if (!totalPages || totalPages <= 1) return null

  function goTo(next) {
    onPageChange(next)
    if (containerRef?.current) {
      const top = containerRef.current.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex items-center justify-center gap-4 pt-6">
      <ArrowButton direction="left" onClick={() => goTo(page - 1)} disabled={page <= 1} aria-label="Previous page" className={PAGE_ARROW_CLASS} />
      <div className={`transition-opacity duration-200 ${isPending ? "opacity-50" : "opacity-100"}`}>
        <Chip label={`Page ${page} of ${totalPages}`} size="sm" variant="ghost" />
      </div>
      <ArrowButton direction="right" onClick={() => goTo(page + 1)} disabled={page >= totalPages} aria-label="Next page" className={PAGE_ARROW_CLASS} />
    </div>
  )
}
