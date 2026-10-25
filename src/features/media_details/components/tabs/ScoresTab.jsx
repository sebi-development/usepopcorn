import { useMemo, memo } from "react"
import { FaImdb } from "react-icons/fa"
import { SiRottentomatoes, SiMetacritic } from "react-icons/si"
import { HiArrowTopRightOnSquare } from "react-icons/hi2"
import useCsfdScore from "@/features/media_details/hooks/useCsfdScore"
import useMdblistScores from "@/features/media_details/hooks/useMdblistScores"
import BentoGrid from "@/components/ui/BentoGrid"
import ScoreRing from "@/features/media_details/components/ScoreRing"
import { TomatoIcon, PopcornIcon } from "@/features/media_details/components/RtIcons"

const SCORE_CARD_CLASS = "flex flex-row-reverse items-center justify-between gap-3 min-w-0 p-4 sm:flex-col sm:p-6 sm:min-h-35"

// Each platform's own good / mixed thresholds (0–100) in one palette, so green means good everywhere
const toneFrom = (good, mixed) => (pct) => pct == null ? null : pct >= good ? "success" : pct >= mixed ? "warning" : "danger"
const IMDB_TONE = toneFrom(70, 50)
const METACRITIC_TONE = toneFrom(61, 40)
const RT_TONE = toneFrom(60, 60)
const CSFD_TONE = toneFrom(70, 30)

// react-icons has no ČSFD logo
function CsfdIcon({ className }) {
  return (
    <span className={`${className} grid place-items-center rounded-[5px] bg-[#BA0300] text-[13px] font-black leading-none text-white`}>
      Č
    </span>
  )
}

// While loading, an empty slot holds the mark's place so the caption doesn't move when it lands
function RottenMeter({ value, icon: Icon, caption, loading }) {
  return (
    <span className="flex flex-col items-center gap-1.5">
      <ScoreRing pct={value} label={value} suffix="%" tone={RT_TONE(value)} size="md" loading={loading} />
      <span className="flex items-center gap-1 text-xs text-text-muted">
        {loading ? <span className="size-4" /> : value != null && <Icon score={value} className="size-4" />}
        {caption}
      </span>
    </span>
  )
}

const RottenScore = memo(function RottenScore({ critics, audience, loading }) {
  return (
    <span className="flex items-start gap-3 sm:gap-5">
      <RottenMeter value={critics} icon={TomatoIcon} caption="Critics" loading={loading} />
      <RottenMeter value={audience} icon={PopcornIcon} caption="Audience" loading={loading} />
    </span>
  )
})

// One query per source, so a slow or failed lookup only affects its own tiles. DetailPage prefetches both.
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
              {/* The arrow marks the tiles that link out */}
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
