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

const toPersonRef = ({ id, name, profile_path }) => ({ id, name, profile_path })

// Every credited director (co-directors like the Russos)
export const toDirectors = (crew = []) => crew.filter((c) => c.job === 'Director').map(toPersonRef)

// A series' creators, from its details: the head of its crew row, as directors are a movie's
export const toCreators = (createdBy = []) => createdBy.map(toPersonRef)

// The crew row after the directors / creators, in order: label, TMDB jobs, how many people it keeps
const CREW_ROLES = [
  ['Writer', ['Screenplay', 'Writer'], 2],
  ['Novel', ['Novel'], 1],
  ['Composer', ['Original Music Composer'], 1],
  ['Cinematographer', ['Director of Photography'], 1],
]

// Credits listed best first → one entry per role and person. A pick without a photo is dropped, not
// replaced by the next one down: a placeholder looks unfinished, a lesser name would mislead.
const pickCrew = (credits) => CREW_ROLES.flatMap(([label, jobs, limit]) => credits
  .filter((c) => jobs.includes(c.job))
  .slice(0, limit)
  .filter((c) => c.profile_path)
  .map((c) => ({ ...toPersonRef(c), job: label })))

export const toMovieCrew = (crew = []) => pickCrew(crew)

// aggregate_credits nests a person's jobs; flattened and sorted by episodes, they pick like a movie's
export const toTvCrew = (crew = []) => pickCrew(crew
  .flatMap((c) => c.jobs.map((j) => ({ ...c, job: j.job, episodes: j.episode_count })))
  .sort((a, b) => b.episodes - a.episodes))

// One card per person, heads first: someone with several jobs shows them in row order ("Director, Writer")
export function toCrewCards(heads, headJob, crew) {
  const cards = new Map()
  for (const { job, ...person } of [...heads.map((h) => ({ ...h, job: headJob })), ...crew]) {
    const card = cards.get(person.id)
    if (!card) cards.set(person.id, { ...person, jobs: [job] })
    else if (!card.jobs.includes(job)) card.jobs.push(job)
  }
  return [...cards.values()]
}

// A series' aggregate_credits.cast, sorted by episode count; roles[0] is TMDB's main role
export const toTvCast = (cast = []) => cast.slice(0, CAST_LIMIT).map((c) => ({
  id: c.id,
  name: c.name,
  profile_path: c.profile_path,
  character: c.roles[0]?.character,
  episodes: c.total_episode_count,
}))

// TMDB names a person's department ("Acting"); the UI names their role. Others show as TMDB names them.
const ROLE_LABELS = { Acting: 'Actor', Directing: 'Director', Writing: 'Writer', Production: 'Producer', Editing: 'Editor', Camera: 'Cinematographer' }
export const departmentLabel = (department) => ROLE_LABELS[department] ?? department

// A /search/person result
export const toPersonItem = (person) => ({
  id: person.id,
  name: person.name,
  profile_path: person.profile_path,
  known_for_department: departmentLabel(person.known_for_department),
  known_for: person.known_for?.map((item) => item.title || item.name).slice(0, 2) ?? [],
})
