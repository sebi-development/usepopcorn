import { useMemo, memo } from "react"
import { FaImdb } from "react-icons/fa"
import { SiRottentomatoes, SiMetacritic } from "react-icons/si"
import { HiArrowTopRightOnSquare } from "react-icons/hi2"
import useCsfdScore from "@/features/media_details/hooks/useCsfdScore"
import useMdblistScores from "@/features/media_details/hooks/useMdblistScores"
import BentoGrid from "@/components/ui/BentoGrid"
import SkeletonBox from "@/components/ui/SkeletonBox"
import PlatformScore from "@/features/media_details/components/PlatformScore"

// Below sm each platform is one compact row (label left, score right) instead of a 140px tile.
// min-w-0: a grid item won't shrink below its content width, so without it a wide score row
// would stretch the one-column grid past the panel instead of letting the label wrap.
const SCORE_CARD_CLASS = "flex flex-row-reverse items-center justify-between gap-3 min-w-0 p-4 sm:flex-col sm:p-6 sm:min-h-35"

// react-icons has no ČSFD logo. A brand-red tile with the Č is a few bytes of markup and needs no
// image request; it takes the same className (size, shrink) as the icons next to it.
function CsfdIcon({ className }) {
  return (
    <span className={`${className} grid place-items-center rounded-[5px] bg-[#BA0300] text-[13px] font-black leading-none`}>
      Č
    </span>
  )
}

// Tomatometer (critics) and Popcornmeter (audience) side by side, each captioned since the two
// circles look alike. A missing one shows "-".
function RottenScore({ critics, audience }) {
  return (
    <span className="flex items-start gap-3">
      <span className="flex flex-col items-center gap-1">
        <PlatformScore value={critics} suffix="%" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Critics</span>
      </span>
      <span className="flex flex-col items-center gap-1">
        <PlatformScore value={audience} suffix="%" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Audience</span>
      </span>
    </span>
  )
}

// Each source has its own query, so a slow lookup or a failure only affects its own tiles: a tile
// shows a skeleton while `loading` and "-" when there's no score. DetailPage prefetches the queries
// on page open, so they usually read a filled cache.
function CriticScoresTab({ media }) {
  const { id: tmdbId, type, imdb_id: imdbId } = media
  const { data: csfd, isLoading: csfdLoading } = useCsfdScore(imdbId)
  const { data: mdblist, isLoading: mdblistLoading } = useMdblistScores(type, tmdbId)

  const platforms = useMemo(() => [
    {
      id: "imdb",
      name: "IMDb",
      icon: FaImdb,
      score: <PlatformScore value={mdblist?.imdb} scale={10} />,
      iconColor: "text-[#f5c518]",
      loading: mdblistLoading,
    },
    {
      id: "rt",
      name: "Rotten Tomatoes",
      icon: SiRottentomatoes,
      score: <RottenScore critics={mdblist?.rtCritics} audience={mdblist?.rtAudience} />,
      iconColor: "text-[#fa320a]",
      url: mdblist?.rtUrl,
      loading: mdblistLoading,
    },
    {
      id: "metacritic",
      name: "Metacritic",
      icon: SiMetacritic,
      score: <PlatformScore value={mdblist?.metacritic} />,
      iconColor: "text-[#61c74f]",
      loading: mdblistLoading,
    },
    {
      id: "csfd",
      name: "ČSFD",
      icon: CsfdIcon,
      score: <PlatformScore value={csfd?.rating} suffix="%" />,
      iconColor: "text-white",
      url: csfd?.url,
      loading: csfdLoading,
    },
  ], [mdblist, mdblistLoading, csfd, csfdLoading])

  return (
    <div className="mt-2">
      <BentoGrid className="bento-grid--scores">
        {platforms.map(({ id, name, icon: Icon, score, iconColor, url, loading }) => (
          <BentoGrid.Card
            key={id}
            href={url}
            className={SCORE_CARD_CLASS}
          >
            <div className="flex items-center justify-center shrink-0 sm:w-full sm:mb-4">
              {loading ? <SkeletonBox className="w-14 h-14 rounded-full" /> : score}
            </div>

            <div className="flex items-center gap-2.5 min-w-0 text-text-muted sm:mt-auto sm:w-full sm:justify-center">
              <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
              <span className="text-xs font-semibold uppercase tracking-wider leading-tight text-text-muted">
                {name}
              </span>
              {/* Every tile shares the same hover, so the arrow is what marks the ones that link out */}
              {url && (
                <>
                  <HiArrowTopRightOnSquare className="w-3.5 h-3.5 shrink-0 max-[359px]:hidden" aria-hidden="true" />
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
