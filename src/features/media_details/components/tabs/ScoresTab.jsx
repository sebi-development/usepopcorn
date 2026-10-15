import { useMemo, memo } from "react"
import { FaImdb } from "react-icons/fa"
import { SiRottentomatoes, SiMetacritic } from "react-icons/si"
import { HiArrowTopRightOnSquare } from "react-icons/hi2"
import useExternalApis from "@/features/media_details/hooks/useExternalApis"
import useCsfdScore from "@/features/media_details/hooks/useCsfdScore"
import BentoGrid from "@/components/ui/BentoGrid"
import SkeletonBox from "@/components/ui/SkeletonBox"
import AlertBanner from "@/components/ui/AlertBanner"

// Below sm each platform is one compact row (label left, score right ≈ 56px) instead of a 140px tile
const SCORE_CARD_CLASS = "flex flex-row-reverse items-center justify-between p-4 sm:flex-col sm:p-6 sm:min-h-35"

// react-icons has no ČSFD logo. A brand-red tile with the Č is a few bytes of markup and needs no
// image request; it takes the same className (size, shrink) as the icons next to it.
function CsfdIcon({ className }) {
  return (
    <span className={`${className} grid place-items-center rounded-[5px] bg-[#BA0300] text-[13px] font-black leading-none`}>
      Č
    </span>
  )
}

function CriticScoresSkeleton() {
  return (
    <BentoGrid className="delayed-reveal bento-grid--scores">
      {[1, 2, 3, 4].map((i) => (
        <BentoGrid.Card key={i} className={SCORE_CARD_CLASS}>
          <div className="flex items-center gap-2.5">
            <SkeletonBox className="w-6 h-6 rounded-md shrink-0" />
            <SkeletonBox className="w-20 h-4 rounded-md" />
          </div>
          <SkeletonBox className="w-24 h-10 rounded-xl sm:mt-5" />
        </BentoGrid.Card>
      ))}
    </BentoGrid>
  )
}

// DetailPage prefetches both queries on page open, so these usually read a filled cache
function CriticScoresTab({ imdbId }) {
  const { data: scores, isLoading, isError } = useExternalApis(imdbId)
  // ČSFD has its own query: a slow lookup or a failure only affects its own card
  const { data: csfd, isLoading: csfdLoading } = useCsfdScore(imdbId)

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
      {
        id: "csfd",
        name: "ČSFD",
        icon: CsfdIcon,
        score: csfd?.rating != null ? `${csfd.rating}%` : "N/A",
        iconColor: "text-white",
        url: csfd?.url,
        loading: csfdLoading,
      },
    ]
  }, [scores, csfd, csfdLoading])

  if (!imdbId) {
    return (
      <AlertBanner title="External scores are not available for this title" variant="info" />
    )
  }

  if (isLoading) return <CriticScoresSkeleton />

  if (isError) {
    return (
      <AlertBanner variant="danger" message="Failed to load platform scores. Please try again later." />
    )
  }

  return (
    <div className="animate-in fade-in duration-300 mt-2">
      <BentoGrid className="bento-grid--scores">
        {platforms.map(({ id, name, icon: Icon, score, iconColor, url, loading }) => (
          <BentoGrid.Card
            key={id}
            href={url}
            className={SCORE_CARD_CLASS}
          >
            <div className="flex items-center justify-center sm:w-full sm:mb-4">
              <div className="px-5 py-2 rounded-2xl bg-surface-900/60 border border-white/10 text-text font-bold text-base tracking-tight shadow-inner transition-colors hover:border-white/20">
                {loading ? <SkeletonBox className="w-10 h-6 rounded-md" /> : score}
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-text-muted sm:mt-auto sm:w-full sm:justify-center">
              <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {name}
              </span>
              {/* The only tile that goes somewhere; the others share its hover, so this marks it */}
              {url && (
                <>
                  <HiArrowTopRightOnSquare className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </>
              )}
            </div>
          </BentoGrid.Card>
        ))}
      </BentoGrid>
    </div>
  )
}

export default memo(CriticScoresTab);
