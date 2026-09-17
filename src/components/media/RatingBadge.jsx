import { HiStar } from "react-icons/hi2"

export default function RatingBadge({ text, icon: Icon = HiStar, size = 12, className = "" }) {
  if (!text) return null
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Icon && <Icon className="text-amber-300" size={size} />}
      <span>{text}</span>
    </div>
  )
}
