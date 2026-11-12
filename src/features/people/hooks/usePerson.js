import { useQuery } from "@tanstack/react-query"
import { getPerson } from "@/services/tmdb"
import { toMediaItem } from "@/utils/tmdbItem"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

const SELF = /^(self|himself|herself)\b/i
const ARCHIVE = /\(archiv(e|al) footage\)/i
const UNCREDITED = /\(uncredited\)/i
const NOT_ACTING_GENRES = [99, 10763, 10764, 10767]
const MUSIC = 10402
const SHOW_GENRES = [99, MUSIC]
export const REGULAR_EPISODES = 5

// The whole character is their name or an alias ("Kanye West" for Ye), not a word it starts ("Yeoman")
const playsSelf = (character, names) => names.some((n) => character.startsWith(n) && !/\p{L}/u.test(character[n.length] ?? ''))

// Not acting: playing themselves, reused footage, documentaries and TV appearances
const isRole = (c, names) => !SELF.test(c.character)
  && !ARCHIVE.test(c.character)
  && !playsSelf(c.character?.toLowerCase() ?? '', names)
  && !c.genre_ids?.some((g) => NOT_ACTING_GENRES.includes(g))

const toCredit = (c) => ({
  ...toMediaItem(c),
  vote_count: c.vote_count,
  order: c.order,
  episode_count: c.episode_count,
  character: c.character,
  video: c.video,
})

const uniqueTitles = (credits) => [
  ...new Map(credits.toSorted((a, b) => (a.episode_count ?? 0) - (b.episode_count ?? 0)).map((c) => [`${c.media_type}:${c.id}`, c])).values(),
]

// Votes only tell minor titles apart once the person has a widely seen one (TMDB has few for local cinema)
const WELL_KNOWN_VOTES = 1000
const MAX_MIN_VOTES = 50
const RECENT_DAYS = 183

// Drops titles under 1% of the votes of their most-voted one (at most 50); upcoming, recent and regular series roles stay
function withoutMinor(credits) {
  const top = Math.max(0, ...credits.map((c) => c.vote_count ?? 0))
  if (top < WELL_KNOWN_VOTES) return credits
  const min = Math.min(MAX_MIN_VOTES, top / 100)
  const since = new Date(Date.now() - RECENT_DAYS * 864e5).toISOString().slice(0, 10)
  return credits.filter((c) => c.vote_count >= min || c.episode_count >= REGULAR_EPISODES || !c.release_date || c.release_date > since)
}

// Only acting, directing and created series reach the cache
function toPerson(data) {
  const { cast = [], crew = [] } = data.combined_credits ?? {}
  const created = new Set(crew.filter((c) => c.job === 'Creator').map((c) => c.id))
  const names = [data.name, ...(data.also_known_as ?? [])].map((n) => n.toLowerCase())
  const roles = cast.filter((c) => isRole(c, names))
  // A musician (Self in more music titles than roles) keeps the films named after them, e.g. "jeen-yuhs: A Kanye Trilogy"
  const musician = uniqueTitles(cast.filter((c) => SELF.test(c.character) && c.genre_ids?.includes(MUSIC))).length > uniqueTitles(roles).length
  const nameWords = new Set(names.flatMap((n) => n.match(/\p{L}{4,}/gu) ?? []))
  const selfTitled = musician ? cast.filter((c) => c.vote_count >= MAX_MIN_VOTES
    && c.genre_ids?.some((g) => SHOW_GENRES.includes(g))
    && (c.title || c.name).toLowerCase().match(/\p{L}+/gu)?.some((w) => nameWords.has(w))) : []
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
    acting: withoutMinor(uniqueTitles([...roles.map(toCredit), ...selfTitled.map((c) => ({ ...toCredit(c), selfTitled: true }))])),
    directing: withoutMinor(uniqueTitles(crew
      .filter((c) => c.job === 'Director' || c.job === 'Creator')
      .map((c) => ({ ...toCredit(c), created: c.media_type === 'tv' && created.has(c.id) })))),
  }
}

export const isMajorRole = (c) => c.selfTitled || (c.media_type === 'movie' ? c.order < 15 : c.episode_count >= REGULAR_EPISODES)

const BEHIND_CAMERA = ['Directing', 'Writing']
const votes = (credits) => credits.reduce((sum, c) => sum + (c.vote_count ?? 0), 0)

// Directing for someone known for it, whose directed titles outdraw their main roles (TMDB files Greta Gerwig
// under Acting), or with no acting credits; acting otherwise
export const defaultRole = (person) => (!person.acting.length
  || (BEHIND_CAMERA.includes(person.known_for_department) && person.directing.length)
  || votes(person.directing) > votes(person.acting.filter(isMajorRole))
  ? 'directing'
  : 'acting')

export const ROLE_LABELS = { acting: 'Actor', directing: 'Director' }
const ROLE_DEPARTMENTS = { acting: 'Acting', directing: 'Directing' }

// TMDB's department, except Acting/Directing follow the role the page leads with
export function knownForDepartment(person) {
  const role = defaultRole(person)
  const department = person.known_for_department
  return person[role].length && Object.values(ROLE_DEPARTMENTS).includes(department) ? ROLE_DEPARTMENTS[role] : department
}

// What Your collection counts: credited feature films, regular or created series, a musician's own films.
// Shorts (`shortIds`) and video compilations stay in the filmography only.
export function isOwnTitle(c, role, shortIds) {
  const acting = role === 'acting'
  if (c.selfTitled) return true
  if (c.media_type === 'tv') return (!acting && c.created) || c.episode_count >= REGULAR_EPISODES
  return !shortIds.has(c.id) && (acting ? !UNCREDITED.test(c.character) : !c.video)
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
