import { memo } from "react"

import getTmdbImageUrl from "@/utils/tmdbImage"

const FADE = "linear-gradient(to bottom, #000 0%, #000 40%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.2) 85%, transparent 100%)"
const MASK_STYLE = { maskImage: FADE, WebkitMaskImage: FADE }
const SCRIM_STYLE = { background: "linear-gradient(90deg, rgba(7,9,11,0.7), rgba(7,9,11,0.1) 60%, rgba(7,9,11,0.4)), linear-gradient(rgba(7,9,11,0.3), rgba(7,9,11,0.3))" }

// Full width, from the top of the page. It reaches up past the navbar (the part above the page is
// clipped), or an edge would show under it.
function DetailBackdrop({ path }) {
  if (!path) return null

  const small = getTmdbImageUrl(path, 'w780')

  return (
    <div aria-hidden="true" className="pointer-events-none absolute -z-10 left-1/2 w-screen -translate-x-1/2 -top-28 h-80 md:-top-44 md:h-144" style={MASK_STYLE}>
      <img
        src={small}
        srcSet={`${small} 780w, ${getTmdbImageUrl(path, 'w1280')} 1280w`}
        sizes="100vw"
        alt=""
        decoding="async"
        className="size-full object-cover object-[50%_25%]"
      />
      <div className="absolute inset-0" style={SCRIM_STYLE} />
    </div>
  )
}

export default memo(DetailBackdrop)
