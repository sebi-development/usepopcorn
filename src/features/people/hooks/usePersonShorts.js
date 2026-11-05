import { useQuery } from "@tanstack/react-query"
import { discoverMedia } from "@/services/tmdb"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"
import { today } from "@/utils/tmdbItem"

// Under 40 minutes is a short (the Academy's line). A person's credits carry no runtime, but /discover
// filters by it; a few pages cover even a prolific career.
const SHORT_MAX_MINUTES = 39
const MAX_PAGES = 3

async function getShortIds(personId, role) {
  const params = {
    [role === 'acting' ? 'with_cast' : 'with_crew']: personId,
    'with_runtime.lte': SHORT_MAX_MINUTES,
    'primary_release_date.lte': today(),
    include_video: true,
  }
  const first = await discoverMedia('movie', params)
  // total_pages is 0 when they have no shorts
  const more = Math.max(Math.min(first.total_pages, MAX_PAGES) - 1, 0)
  const rest = await Promise.all(Array.from({ length: more }, (_, i) => discoverMedia('movie', params, i + 2)))
  return [first, ...rest].flatMap((page) => page.results.map((movie) => movie.id))
}

// The ids of a person's short films, which the Collection tab leaves out of its count. Mounted by that
// tab only, so the request starts on its first open.
export default function usePersonShorts(personId, role) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.personShorts(personId, role),
    queryFn: () => getShortIds(personId, role),
    enabled: !!personId,
    ...CACHE.media,
  })

  return { data, isLoading }
}
