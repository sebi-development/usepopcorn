import { useQuery } from "@tanstack/react-query"
import { getPersonAwards } from "@/services/wikidata"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// The ceremonies the Awards tab counts, matched on Wikidata's English award label. Everything else
// (critics' circles, genre and festival side prizes) is dropped.
const CEREMONIES = [
  ['Oscars', /^Academy Award for /],
  ['Golden Globes', /^Golden Globe Award/],
  ['BAFTA', /^(BAFTA|British Academy)/],
  ['Emmys', /^Primetime Emmy Award/],
  ['SAG Awards', /^Screen Actors Guild Award/],
  ['Cannes', /^(Palme d'Or|Cannes)/],
  ['Venice', /^(Golden Lion|Volpi Cup)/],
  ['Berlin', /^(Golden Bear|Silver Bear)/],
]
// State honours (knighthoods, orders), shown apart from the film awards
const HONOUR = /^(Knight|Dame) |Order of |Legion of Honour|Kennedy Center Honors|Medal of Freedom/
const MAX_WINS = 20
const MAX_HONOURS = 4

const value = (row, field) => row[field]?.value

// Cuts the SPARQL rows to the tab's three lists, so the cache holds only what it shows
function toAwards(rows) {
  const counts = new Map()
  const wins = new Map()
  const honours = new Map()

  for (const row of rows) {
    const label = value(row, 'awardLabel')
    const year = value(row, 'time')?.slice(0, 4) ?? null
    const isWin = value(row, 'kind') === 'win'
    const ceremony = CEREMONIES.find(([, match]) => match.test(label))?.[0]

    if (!ceremony) {
      if (isWin && HONOUR.test(label)) honours.set(label, { label, year })
      continue
    }

    // One award in one year counts once; Wikidata lists some wins without a nomination of their own,
    // so every win is also a nomination
    const key = `${label}|${year}`
    const count = counts.get(ceremony) ?? { wins: new Set(), nominations: new Set() }
    count.nominations.add(key)
    counts.set(ceremony, count)
    if (!isWin) continue

    count.wins.add(key)
    const film = value(row, 'workLabel') ?? null
    const movie = value(row, 'movie')
    wins.set(`${key}|${film}`, {
      key: `${key}|${film}`,
      year,
      ceremony,
      category: label.match(/ for (.+)$/)?.[1] ?? label,
      film,
      id: Number(movie ?? value(row, 'tv')) || null,
      type: movie ? 'movie' : 'tv',
    })
  }

  return {
    tally: CEREMONIES.filter(([name]) => counts.has(name)).map(([name]) => ({
      name,
      wins: counts.get(name).wins.size,
      nominations: counts.get(name).nominations.size,
    })),
    wins: [...wins.values()].sort((a, b) => (b.year ?? '').localeCompare(a.year ?? '')).slice(0, MAX_WINS),
    honours: [...honours.values()].slice(0, MAX_HONOURS),
  }
}

// Fetched only when the Awards tab mounts; awards rarely change, so a title-length cache tier
export default function usePersonAwards(personId) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.personAwards(personId),
    queryFn: async () => toAwards(await getPersonAwards(personId)),
    enabled: !!personId,
    ...CACHE.media,
  })

  return { data, isLoading, error }
}
