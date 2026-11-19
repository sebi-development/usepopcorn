import { memo, useMemo } from "react"
import MediaRow from "@/components/media/MediaRow/MediaRow"
import { CARD_ACTIONS } from "@/components/media/cardActions"
import FilterBar from "@/components/filters/FilterBar"
import Chip from "@/components/ui/Chip"
import { useUrlPage } from "@/hooks/useUrlGrid"
import { NO_MATCHES } from "@/utils/filters"
import { PAGE_SIZE } from "@/utils/pagination"
import useFilmographyFilters from "@/features/people/components/Filmography/useFilmographyFilters"
import { pickKnownFor } from "@/features/people/components/Filmography/credits"

function Filmography({ person }) {
  const { primary, defs, filters, onFilter, clearFilters, shown } = useFilmographyFilters(person)
  const knownFor = useMemo(() => pickKnownFor(person, primary), [person, primary])

  // In the URL, which a filter change drops: new filters open on page 1
  const { page, setPage } = useUrlPage()
  const pageItems = useMemo(() => shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [shown, page])

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <MediaRow heading="Known for" data={knownFor} rank={false} showRating actions={CARD_ACTIONS.browse} />

      <div className="flex flex-col gap-4">
        <h2 className="heading-section md:px-6">
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
          actions={CARD_ACTIONS.browse}
          emptyNote={NO_MATCHES}
        />
      </div>
    </div>
  )
}

export default memo(Filmography)
