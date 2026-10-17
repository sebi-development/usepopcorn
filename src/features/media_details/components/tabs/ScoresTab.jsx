import { useMemo, memo } from "react"
import { FaImdb } from "react-icons/fa"
import { SiRottentomatoes, SiMetacritic } from "react-icons/si"
import { LuPopcorn } from "react-icons/lu"
import { HiArrowTopRightOnSquare } from "react-icons/hi2"
import useCsfdScore from "@/features/media_details/hooks/useCsfdScore"
import useMdblistScores from "@/features/media_details/hooks/useMdblistScores"
import BentoGrid from "@/components/ui/BentoGrid"
import SkeletonBox from "@/components/ui/SkeletonBox"

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

// Tomatometer (critics) first, then Popcornmeter (audience) behind the popcorn icon. Either can be
// missing, so each shows only if it exists.
function RottenScore({ critics, audience }) {
  if (critics == null && audience == null) return "N/A"

  return (
    <span className="inline-flex items-center gap-2 sm:gap-3">
      {critics != null && <span><span className="sr-only">Critics </span>{critics}%</span>}
      {audience != null && (
        <span className="inline-flex items-center gap-1">
          <LuPopcorn className="w-4 h-4 text-[#fa320a]" aria-hidden="true" />
          <span className="sr-only">Audience </span>{audience}%
        </span>
      )}
    </span>
  )
}

// Each source has its own query, so a slow lookup or a failure only affects its own tiles: a tile
// shows a skeleton while `loading` and N/A when there's no score. DetailPage prefetches the queries
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
      score: mdblist?.imdb != null ? `${mdblist.imdb}/10` : "N/A",
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
      score: mdblist?.metacritic != null ? `${mdblist.metacritic}/100` : "N/A",
      iconColor: "text-[#61c74f]",
      loading: mdblistLoading,
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
              <div className="px-3 py-2 sm:px-5 rounded-2xl bg-surface-900/60 border border-white/10 text-text font-bold text-sm sm:text-base tracking-tight shadow-inner transition-colors hover:border-white/20">
                {loading ? <SkeletonBox className="w-10 h-6 rounded-md" /> : score}
              </div>
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
