import { memo } from "react"
import MediaRow from "@/components/media/MediaRow"

// Lazy-loaded tab. The items come with the details request (see useMediaDetails), so opening
// the tab fetches nothing; the full paged list is in Browse → Inspire. The section heading is
// rendered by DetailPage, like the Scores tab's.
function SimilarTab({ items, type }) {
  return (
    <MediaRow
      data={items}
      mediaType={type}
      rank={false}
      showRating
      showFavorite
      showWatchlist
    />
  )
}

export default memo(SimilarTab)
