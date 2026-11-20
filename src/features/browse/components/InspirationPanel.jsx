import { useMemo } from 'react'
import { HiOutlineSparkles } from 'react-icons/hi2'
import RecommendationRow from '@/features/browse/components/RecommendationRow'

const EMPTY_NOTE = "TMDB has no recommendations for this title yet. Try another one."
const SUBTITLES = {
  movie: "Name a movie you love and get similar ones.",
  tv: "Name a series you love and get similar ones.",
}
const KEY = "font-medium text-text"
const STEPS = [
  <>Open <span className="rounded-md border border-primary-lighter/30 bg-primary/15 px-2 py-0.5 font-medium text-primary-lighter">Inspire</span> in the menu</>,
  <>Search the title and <span className={KEY}>pick it</span> from the list</>,
  <><span className={KEY}>Recommendations</span> appear right here</>,
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
      <div className="flex w-full max-w-100 flex-col gap-6 rounded-3xl border border-primary-light/20 bg-surface-900/50 px-5 py-6 shadow-2xl backdrop-blur-xl sm:gap-8 sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-full border border-primary-lighter/25 bg-primary/15">
            <HiOutlineSparkles className="text-2xl text-primary-lighter" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl">Find your next watch</h1>
            <p className="text-sm font-normal leading-relaxed text-text-muted">{SUBTITLES[type]}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-surface-100 bg-white/2 p-4 sm:p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-text-subtle">How it works</span>
          <ol role="list" className="flex flex-col text-sm leading-relaxed text-text-muted">
            {STEPS.map((step, i) => (
              <li key={i} className="relative flex items-center gap-3 pb-4 last:pb-0">
                {/* The list already numbers the steps for assistive tech; badge and line are decoration */}
                {i < STEPS.length - 1 && <span aria-hidden="true" className="absolute left-3 top-7 bottom-1 w-px bg-surface-300" />}
                <span
                  aria-hidden="true"
                  className={`relative flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${i === 0 ? 'bg-primary text-white' : 'border border-primary-lighter/30 bg-surface-900 text-primary-lighter'}`}
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
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
