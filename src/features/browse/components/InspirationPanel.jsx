import { useMemo } from 'react'
import { HiOutlineSparkles } from 'react-icons/hi2'
import RecommendationRow from '@/features/browse/components/RecommendationRow'
import InfoCard from '@/components/ui/InfoCard'
import Chip from '@/components/ui/Chip'

const EMPTY_NOTE = "TMDB has no recommendations for this title yet. Try another one."
const ICON = <HiOutlineSparkles className="text-3xl text-primary-light" />
const SUBTITLES = {
  movie: "Name a movie you love and get similar ones.",
  tv: "Name a series you love and get similar ones.",
}
const STEPS = [
  <>Open <span className="text-text">Inspire</span> in the menu</>,
  'Search the title and pick it from the list',
  'Recommendations appear right here',
]

// The search lives in the category rail (see InspireSearch); this is what it drives:
// recommendations for the picked title, or a short how-to until one is picked.
// `type` is 'movie' | 'tv', from the rail section the page was opened from.
export default function InspirationPanel({ type, seed }) {
  const rowSeed = useMemo(
    () => (seed ? { pick: { tmdb_id: seed.tmdb_id, title: seed.title } } : null),
    [seed]
  )

  if (!seed) return (
    <div className="flex justify-center md:pt-6">
      <InfoCard icon={ICON} title="Find your next watch" subtitle={SUBTITLES[type]}>
        <ol role="list" className="flex flex-col gap-3 text-sm text-text-muted">
          {STEPS.map((step, i) => (
            <li key={i} className="flex items-center gap-3">
              {/* The list already numbers the steps for assistive tech; the Chip is decoration */}
              <span aria-hidden="true" className="shrink-0">
                <Chip variant="ghost" size="sm" className="size-6 p-0! backdrop-blur-none!">{i + 1}</Chip>
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </InfoCard>
    </div>
  )

  return (
    <RecommendationRow
      key={`${type}-${seed.tmdb_id}`}
      seed={rowSeed}
      type={type}
      heading={seed.year ? `If you liked "${seed.title}" (${seed.year})` : `If you liked "${seed.title}"`}
      emptyNote={EMPTY_NOTE}
    />
  )
}
