import { useMemo, memo } from "react"
import { FaImdb } from "react-icons/fa"
import { SiRottentomatoes, SiMetacritic } from "react-icons/si"
import { HiArrowTopRightOnSquare } from "react-icons/hi2"
import useCsfdScore from "@/features/media_details/hooks/useCsfdScore"
import useMdblistScores from "@/features/media_details/hooks/useMdblistScores"
import BentoGrid from "@/components/ui/BentoGrid"
import ScoreRing from "@/features/media_details/components/ScoreRing"
import { TomatoIcon, PopcornIcon } from "@/features/media_details/components/RtIcons"

// Below sm each platform is one compact row (label left, score right) instead of a 140px tile.
// min-w-0: a grid item won't shrink below its content width, so without it a wide score row
// would stretch the one-column grid past the panel instead of letting the label wrap.
const SCORE_CARD_CLASS = "flex flex-row-reverse items-center justify-between gap-3 min-w-0 p-4 sm:flex-col sm:p-6 sm:min-h-35"

// Each platform draws its own line between good and bad, so the ring tone uses its thresholds on
// the 0–100 value: green from `good`, amber from `mixed`, red below. One palette across the tiles
// keeps green meaning good everywhere.
const toneFrom = (good, mixed) => (pct) => pct == null ? null : pct >= good ? "success" : pct >= mixed ? "warning" : "danger"
const IMDB_TONE = toneFrom(70, 50)
const METACRITIC_TONE = toneFrom(61, 40)
const RT_TONE = toneFrom(60, 60)
const CSFD_TONE = toneFrom(70, 30)

// react-icons has no ČSFD logo. A brand-red tile with the Č is a few bytes of markup and needs no
// image request; it takes the same className (size, shrink) as the icons next to it.
function CsfdIcon({ className }) {
  return (
    <span className={`${className} grid place-items-center rounded-[5px] bg-[#BA0300] text-[13px] font-black leading-none text-white`}>
      Č
    </span>
  )
}

// One RT meter: its ring, captioned with RT's own mark for the state (fresh or rotten tomato, full
// or tipped bucket). While loading, an empty slot holds the mark's place so the caption doesn't
// slide when it lands; a missing score shows "–" and no mark.
function RottenMeter({ value, icon: Icon, caption, loading }) {
  return (
    <span className="flex flex-col items-center gap-1.5">
      <ScoreRing pct={value} label={value} suffix="%" tone={RT_TONE(value)} size="md" loading={loading} />
      <span className="flex items-center gap-1 text-xs text-text-muted">
        {loading ? <span className="size-4" /> : value != null && <Icon fresh={value >= 60} className="size-4" />}
        {caption}
      </span>
    </span>
  )
}

// Tomatometer (critics) and Popcornmeter (audience) side by side
const RottenScore = memo(function RottenScore({ critics, audience, loading }) {
  return (
    <span className="flex items-start gap-3 sm:gap-5">
      <RottenMeter value={critics} icon={TomatoIcon} caption="Critics" loading={loading} />
      <RottenMeter value={audience} icon={PopcornIcon} caption="Audience" loading={loading} />
    </span>
  )
})

// Each source has its own query, so a slow lookup or a failure only affects its own tiles: a ring
// pulses as a bare track while loading (same box as the loaded ring, so nothing shifts) and shows
// "–" when there's no score. DetailPage prefetches the queries on page open, so they usually read a
// filled cache.
function CriticScoresTab({ media }) {
  const { id: tmdbId, type, imdb_id: imdbId } = media
  const { data: csfd, isLoading: csfdLoading } = useCsfdScore(imdbId)
  const { data: mdblist, isLoading: mdblistLoading } = useMdblistScores(type, tmdbId)

  const platforms = useMemo(() => {
    const imdb = mdblist?.imdb != null ? mdblist.imdb * 10 : null
    return [
      {
        id: "imdb",
        name: "IMDb",
        icon: FaImdb,
        score: <ScoreRing pct={imdb} label={Number(mdblist?.imdb).toFixed(1)} tone={IMDB_TONE(imdb)} loading={mdblistLoading} />,
        iconColor: "text-[#f5c518]",
      },
      {
        id: "rt",
        name: "Rotten Tomatoes",
        icon: SiRottentomatoes,
        score: <RottenScore critics={mdblist?.rtCritics} audience={mdblist?.rtAudience} loading={mdblistLoading} />,
        iconColor: "text-[#fa320a]",
        url: mdblist?.rtUrl,
      },
      {
        id: "metacritic",
        name: "Metacritic",
        icon: SiMetacritic,
        score: <ScoreRing pct={mdblist?.metacritic} label={mdblist?.metacritic} tone={METACRITIC_TONE(mdblist?.metacritic)} loading={mdblistLoading} />,
        iconColor: "text-[#61c74f]",
      },
      {
        id: "csfd",
        name: "ČSFD",
        icon: CsfdIcon,
        score: <ScoreRing pct={csfd?.rating} label={csfd?.rating} suffix="%" tone={CSFD_TONE(csfd?.rating)} loading={csfdLoading} />,
        url: csfd?.url,
      },
    ]
  }, [mdblist, mdblistLoading, csfd, csfdLoading])

  return (
    <div className="mt-2">
      <BentoGrid className="bento-grid--scores">
        {platforms.map(({ id, name, icon: Icon, score, iconColor = "", url }) => (
          <BentoGrid.Card
            key={id}
            href={url}
            className={SCORE_CARD_CLASS}
          >
            <div className="flex items-center justify-center shrink-0 sm:w-full sm:mb-4">
              {score}
            </div>

            <div className="flex items-center gap-2.5 min-w-0 text-text-muted sm:mt-auto sm:w-full sm:justify-center">
              <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
              <span className="text-sm font-semibold leading-tight text-text">
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
