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

// Their name or an alias as the whole character ("Kanye West" for Ye), not a name that merely starts it ("Yeoman")
const playsSelf = (character, names) => names.some((n) => character.startsWith(n) && !/\p{L}/u.test(character[n.length] ?? ''))

// Not acting work, so not in the filmography: playing themselves (as "Self" or by name), reused footage,
// documentaries (TMDB often leaves their character blank) and TV appearances
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

// Votes only tell a minor title apart once the person has a widely seen one (TMDB knows little of local cinema)
const WELL_KNOWN_VOTES = 1000
const MAX_MIN_VOTES = 50
const RECENT_DAYS = 183

// Drops titles TMDB's audience barely knows (amateur shorts, bit parts): under 1% of the votes of the
// person's most-voted title, at most 50. Upcoming and recent titles and regular series roles stay.
function withoutMinor(credits) {
  const top = Math.max(0, ...credits.map((c) => c.vote_count ?? 0))
  if (top < WELL_KNOWN_VOTES) return credits
  const min = Math.min(MAX_MIN_VOTES, top / 100)
  const since = new Date(Date.now() - RECENT_DAYS * 864e5).toISOString().slice(0, 10)
  return credits.filter((c) => c.vote_count >= min || c.episode_count >= REGULAR_EPISODES || !c.release_date || c.release_date > since)
}

// Only acting, directing and created series reach the cache; other writing, production and crew are dropped
function toPerson(data) {
  const { cast = [], crew = [] } = data.combined_credits ?? {}
  // A series' creator is its head, as a director is a movie's (Creator credits are series only)
  const created = new Set(crew.filter((c) => c.job === 'Creator').map((c) => c.id))
  const names = [data.name, ...(data.also_known_as ?? [])].map((n) => n.toLowerCase())
  const roles = cast.filter((c) => isRole(c, names))
  // A musician is Self in more music titles than they have roles; their documentaries and concert films
  // (titled with their name, e.g. "jeen-yuhs: A Kanye Trilogy") are their screen work, so they count as roles
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

// Directing (and created series) for a director or writer-creator, for someone whose directed titles drew
// more votes than their main roles (TMDB lists Zach Cregger and Greta Gerwig under Acting), or for someone
// with no acting credits; acting otherwise
export const defaultRole = (person) => (!person.acting.length
  || (BEHIND_CAMERA.includes(person.known_for_department) && person.directing.length)
  || votes(person.directing) > votes(person.acting.filter(isMajorRole))
  ? 'directing'
  : 'acting')

export const ROLE_LABELS = { acting: 'Actor', directing: 'Director' }
const ROLE_DEPARTMENTS = { acting: 'Acting', directing: 'Directing' }

// TMDB's department, but between Acting and Directing the one the page leads with (TMDB files Zach
// Cregger under Acting); Writing, Production etc. stay as TMDB has them
export function knownForDepartment(person) {
  const role = defaultRole(person)
  const department = person.known_for_department
  return person[role].length && Object.values(ROLE_DEPARTMENTS).includes(department) ? ROLE_DEPARTMENTS[role] : department
}

// A title the collection counts: a feature film with a credited part, or a series they're a regular in
// or created, or a musician's self-titled film. Shorts (`shortIds`, see usePersonShorts) and video
// compilations stay in the filmography only. A director's documentaries are their own work, so they count.
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
