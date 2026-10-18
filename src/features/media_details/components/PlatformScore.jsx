import { memo } from 'react'

import Score from '@/features/media_details/components/Score'

// An outside platform's score in the small Score circle. The tier is read on Score's 0–100 scale,
// the label keeps the platform's own one: IMDb 7.8 (scale 10), Tomatometer 92%, Metacritic 72.
function PlatformScore({ value, scale = 100, suffix = '' }) {
  if (value == null) return <Score label="-" size="sm" />

  return scale === 10
    ? <Score value={value * 10} label={Number(value).toFixed(1)} size="sm" />
    : <Score value={value} label={`${value}${suffix}`} size="sm" />
}

export default memo(PlatformScore)
