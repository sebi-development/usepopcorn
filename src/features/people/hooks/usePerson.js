import { useQuery } from "@tanstack/react-query"
import { getPerson } from "@/services/tmdb"
import { toMediaItem } from "@/utils/tmdbItem"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

const SELF = /^(self|himself|herself)\b/i
// News, Reality, Talk: TV where everyone appears as themselves
const APPEARANCE_GENRES = [10763, 10764, 10767]

const isRole = (c) => !SELF.test(c.character) && !c.genre_ids?.some((g) => APPEARANCE_GENRES.includes(g))

// vote_count ranks Known for and Popular; order, episode_count and character tell a part from a cameo
const toCredit = (c) => ({
  ...toMediaItem(c),
  vote_count: c.vote_count,
  order: c.order,
  episode_count: c.episode_count,
  character: c.character,
})

// One card per title, keeping the credit with the most episodes (not a one-episode "uncredited" extra)
const uniqueTitles = (credits) => [
  ...new Map(credits.toSorted((a, b) => (a.episode_count ?? 0) - (b.episode_count ?? 0)).map((c) => [`${c.media_type}:${c.id}`, c])).values(),
]

// Only acting and directing credits reach the cache; writing, production and other crew are dropped
function toPerson(data) {
  const { cast = [], crew = [] } = data.combined_credits ?? {}
  return {
    id: data.id,
    name: data.name,
    profile_path: data.profile_path,
    biography: data.biography,
    birthday: data.birthday,
    deathday: data.deathday,
    place_of_birth: data.place_of_birth,
    known_for_department: data.known_for_department,
    imdb_id: data.imdb_id,
    acting: uniqueTitles(cast.filter(isRole).map(toCredit)),
    directing: crew.filter((c) => c.job === 'Director').map(toCredit),
  }
}

export default function usePerson(id) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.person(id),
    queryFn: async () => toPerson(await getPerson(id)),
    enabled: !!id,
    ...CACHE.mediaList,
  })

  return { data, isLoading, error }
}
