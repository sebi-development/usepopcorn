// One table for the episode dots and the legend, so the two can't disagree
const TONES = [
  { label: 'Great', color: 'bg-success', min: 7.5 },
  { label: 'Mixed', color: 'bg-warning', min: 6 },
  { label: 'Poor', color: 'bg-danger', min: 0 },
]
const UNAIRED = { label: 'Unaired', color: 'bg-surface-300' }

export const RATING_LEGEND = [...TONES, UNAIRED]
export const DOT_CLASS = 'block shrink-0 w-2 h-2 rounded-full'

export const isUnaired = (episode, todayISO) => episode.vote_count === 0 || !episode.air_date || episode.air_date > todayISO
export const toneOf = (episode, unaired) => (unaired ? UNAIRED : TONES.find((tone) => episode.vote_average >= tone.min))
