import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"
import useUrlFilters from "@/hooks/useUrlFilters"
import useMediaState from "@/features/interactions/hooks/useMediaState"
import { parseFilters } from "@/utils/filters"
import { defaultRole } from "@/features/people/hooks/usePerson"
import { filterCredits, getDefs, hasBothRoles, ROLE } from "@/features/people/components/Filmography/credits"

// The Filmography's filters (kept in the URL) and the credits they leave
export default function useFilmographyFilters(person) {
  // The role picks the list the other filters' options come from, so it is read before the defs
  const [searchParams] = useSearchParams()
  const primary = defaultRole(person)
  const role = (hasBothRoles(person) && parseFilters(searchParams, [ROLE]).role) || primary
  const defs = useMemo(() => getDefs(person, role, primary), [person, role, primary])
  const { filters, setFilter, clearFilters } = useUrlFilters(defs)
  // Only the other role goes in the URL: picking the primary one returns to the default view
  const onFilter = useCallback((key, value) => setFilter(key, key === 'role' && value === primary ? undefined : value), [setFilter, primary])

  const { ratings } = useMediaState()
  // Ratings change the list only while it filters by them
  const ratingsInUse = filters.rated ? ratings : null
  const shown = useMemo(() => filterCredits(person[role], filters, ratingsInUse), [person, role, filters, ratingsInUse])

  return { primary, defs, filters, onFilter, clearFilters, shown }
}
