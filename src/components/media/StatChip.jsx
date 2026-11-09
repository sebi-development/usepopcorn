import { memo } from "react"
import Chip from "@/components/ui/Chip"
import RatingBadge from "@/components/media/RatingBadge"

// The card's rating chip: a value with its icon (a star unless told otherwise). `className` styles the value.
function StatChip({ text, icon, iconClassName, className }) {
  return (
    <Chip variant="ghost" size="sm" className="shrink-0 shadow-lg font-semibold">
      <RatingBadge text={text} icon={icon} iconClassName={iconClassName} size={14} className={className} />
    </Chip>
  )
}

export default memo(StatChip)
