import { memo } from "react"
import MediaRow from "@/components/media/MediaRow/MediaRow"
import { CARD_ACTIONS } from "@/components/media/cardActions"

function SimilarTab({ items, type }) {
  return (
    <MediaRow
      data={items}
      mediaType={type}
      rank={false}
      showRating
      actions={CARD_ACTIONS.browse}
    />
  )
}

export default memo(SimilarTab)
