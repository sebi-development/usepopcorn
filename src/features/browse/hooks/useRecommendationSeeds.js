import { useMemo } from "react"
import useBestRated from "@/features/profile/hooks/useBestRated"

// Same order as the windows below: narrowest first. A wider window only seeds a
// type when every narrower one had no pick, so the seed is always the most recent.
const NOTES = [undefined, 'last 3 months', 'last 6 months', 'last 12 months']

function firstSeed(picks) {
  const i = picks.findIndex(Boolean)
  return i === -1 ? undefined : { pick: picks[i], note: NOTES[i] }
}

// Recommendation seeds per media type: the pick of the month, falling back to
// the best pick of the last 3, 6 or 12 months. `note` says which window it came from.
export default function useRecommendationSeeds(userId) {
  const month = useBestRated(userId, 'month')

  // The wider windows only fire when the month is missing a type, and all at once,
  // so the fallback costs one round trip instead of three in sequence.
  const needsFallback = !month.isLoading && !month.isError && (!month.movie || !month.tv)
  const quarter = useBestRated(userId, 'quarter', { enabled: needsFallback })
  const halfYear = useBestRated(userId, 'halfYear', { enabled: needsFallback })
  const twelveMonths = useBestRated(userId, 'twelveMonths', { enabled: needsFallback })

  const movie = useMemo(
    () => firstSeed([month.movie, quarter.movie, halfYear.movie, twelveMonths.movie]),
    [month.movie, quarter.movie, halfYear.movie, twelveMonths.movie]
  )
  const tv = useMemo(
    () => firstSeed([month.tv, quarter.tv, halfYear.tv, twelveMonths.tv]),
    [month.tv, quarter.tv, halfYear.tv, twelveMonths.tv]
  )

  return {
    movie,
    tv,
    isLoading: month.isLoading || quarter.isLoading || halfYear.isLoading || twelveMonths.isLoading,
  }
}
