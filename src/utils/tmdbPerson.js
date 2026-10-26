// The fields cast cards read from TMDB credits. A credits list runs to hundreds of
// people, so only the top CAST_LIMIT reach the cache.
export const CAST_LIMIT = 20

// A movie's credits.cast, in billing order
export const toMovieCast = (cast = []) => cast.slice(0, CAST_LIMIT).map((c) => ({
  id: c.id,
  name: c.name,
  profile_path: c.profile_path,
  character: c.character,
}))

// A series' aggregate_credits.cast, sorted by episode count; roles[0] is TMDB's main role
export const toTvCast = (cast = []) => cast.slice(0, CAST_LIMIT).map((c) => ({
  id: c.id,
  name: c.name,
  profile_path: c.profile_path,
  character: c.roles[0]?.character,
  episodes: c.total_episode_count,
}))
