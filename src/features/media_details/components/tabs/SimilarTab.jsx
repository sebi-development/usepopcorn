import { memo } from "react"
import MediaRow from "@/components/media/MediaRow"

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
