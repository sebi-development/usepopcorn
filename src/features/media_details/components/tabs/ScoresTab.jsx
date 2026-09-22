import { useMemo, memo } from "react"
import { FaImdb } from "react-icons/fa"
import { SiRottentomatoes, SiMetacritic } from "react-icons/si"
import useExternalApis from "@/features/media_details/hooks/useExternalApis"
import BentoGrid from "@/components/ui/BentoGrid"
import SkeletonBox from "@/components/ui/SkeletonBox"
import AlertBanner from "@/components/ui/AlertBanner"
import useDelayedLoading from "@/hooks/useDelayedLoading"

function CriticScoresSkeleton() {
  return (
    <BentoGrid>
      {[1, 2, 3].map((i) => (
        <BentoGrid.Card key={i} className="flex flex-col items-center justify-between p-6 min-h-35">
          <div className="flex items-center gap-2.5">
            <SkeletonBox className="w-6 h-6 rounded-md shrink-0" />
            <SkeletonBox className="w-20 h-4 rounded-md" />
          </div>
          <SkeletonBox className="w-24 h-10 rounded-xl mt-5" />
        </BentoGrid.Card>
      ))}
    </BentoGrid>
  )
}

function CriticScoresTab({ imdbId, prefetchedQuery }) {
  // OPT-018: use pre-fetched query from parent when available, fall back to own fetch
  const ownQuery = useExternalApis(prefetchedQuery ? null : imdbId)
  const { data: scores, isLoading, isError } = prefetchedQuery || ownQuery
  const showLoading = useDelayedLoading(isLoading)

  const platforms = useMemo(() => {
    if (!scores) return []
    return [
      {
        id: "imdb",
        name: "IMDb",
        icon: FaImdb,
        score: scores.imdb ? `${scores.imdb}/10` : "N/A",
        iconColor: "text-[#f5c518]",
      },
      {
        id: "rt",
        name: "Rotten Tomatoes",
        icon: SiRottentomatoes,
        score: scores.rottenTomatoes || "N/A",
        iconColor: "text-[#fa320a]",
      },
      {
        id: "metacritic",
        name: "Metacritic",
        icon: SiMetacritic,
        score: scores.metacritic ? `${scores.metacritic}/100` : "N/A",
        iconColor: "text-[#61c74f]",
      },
    ]
  }, [scores])

  if (!imdbId) {
    return (
      <AlertBanner title="External scores are not available for this title" variant="info" />
    )
  }

  if (showLoading) return <CriticScoresSkeleton />

  if (isError) {
    return (
      <AlertBanner variant="danger" message="Failed to load platform scores. Please try again later." />
    )
  }

  return (
    <div className="animate-in fade-in duration-300 mt-2">
      <BentoGrid>
        {platforms.map(({ id, name, icon: Icon, score, iconColor }) => (
          <BentoGrid.Card
            key={id}
            className="flex flex-col items-center justify-between p-6 min-h-35"
          >
            <div className="flex items-center justify-center w-full mb-4">
              <div className="px-5 py-2 rounded-2xl bg-surface-900/60 border border-white/10 text-text font-bold text-base tracking-tight shadow-inner transition-colors hover:border-white/20">
                {score}
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-text-muted mt-auto w-full justify-center">
              <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {name}
              </span>
            </div>
          </BentoGrid.Card>
        ))}
      </BentoGrid>
    </div>
  )
}

export default memo(CriticScoresTab);