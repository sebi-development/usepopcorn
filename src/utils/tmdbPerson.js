// The fields cast cards and people search read from TMDB people. A credits list runs to hundreds of
// people, so only the top CAST_LIMIT reach the cache.
export const CAST_LIMIT = 20

// A movie's credits.cast, in billing order
export const toMovieCast = (cast = []) => cast.slice(0, CAST_LIMIT).map((c) => ({
  id: c.id,
  name: c.name,
  profile_path: c.profile_path,
  character: c.character,
}))

// Every credited director (co-directors like the Russos)
export const toDirectors = (crew = []) => crew.filter((c) => c.job === 'Director').map((c) => ({ id: c.id, name: c.name }))

// A series' aggregate_credits.cast, sorted by episode count; roles[0] is TMDB's main role
export const toTvCast = (cast = []) => cast.slice(0, CAST_LIMIT).map((c) => ({
  id: c.id,
  name: c.name,
  profile_path: c.profile_path,
  character: c.roles[0]?.character,
  episodes: c.total_episode_count,
}))

// A /search/person result
export const toPersonItem = (person) => ({
  id: person.id,
  name: person.name,
  profile_path: person.profile_path,
  known_for_department: person.known_for_department,
  known_for: person.known_for?.map((item) => item.title || item.name).slice(0, 2) ?? [],
})
