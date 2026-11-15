import { memo, useMemo, useState } from "react"
import MediaRow from "@/components/media/MediaRow/MediaRow"
import FilterBar from "@/components/filters/FilterBar"
import Chip from "@/components/ui/Chip"
import { NO_MATCHES } from "@/utils/filters"
import { PAGE_SIZE } from "@/utils/pagination"
import useFilmographyFilters from "@/features/people/components/Filmography/useFilmographyFilters"
import { pickKnownFor } from "@/features/people/components/Filmography/credits"

function Filmography({ person }) {
  const { primary, defs, filters, onFilter, clearFilters, shown } = useFilmographyFilters(person)
  const knownFor = useMemo(() => pickKnownFor(person, primary), [person, primary])

  // New filters mean a new list: back to its first page
  const [page, setPage] = useState(1)
  const [prevFilters, setPrevFilters] = useState(filters)
  if (filters !== prevFilters) {
    setPrevFilters(filters)
    setPage(1)
  }
  const pageItems = useMemo(() => shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [shown, page])

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <MediaRow heading="Known for" data={knownFor} rank={false} showRating showFavorite showWatchlist />

      <div className="flex flex-col gap-4">
        <h2 className="text-text font-semibold text-xl md:px-6">
          Filmography <Chip variant="count" size="sm" label={shown.length} className="ml-2 align-middle" />
        </h2>
        <FilterBar defs={defs} filters={filters} onChange={onFilter} onClear={clearFilters} className="md:px-6" />
        <MediaRow
          data={pageItems}
          isExpanded
          gridItems={pageItems}
          page={page}
          totalPages={Math.ceil(shown.length / PAGE_SIZE)}
          onPageChange={setPage}
          showRating
          showFavorite
          showWatchlist
          emptyNote={NO_MATCHES}
        />
      </div>
    </div>
  )
}

export default memo(Filmography)
