import { BiSolidErrorAlt } from "react-icons/bi"
import { HiExclamationTriangle, HiInformationCircle } from "react-icons/hi2"

const variants = {
  danger: {
    icon: BiSolidErrorAlt,
    containerClass: "bg-danger/10 border-danger/20",
    iconClass: "text-danger",
  },
  warning: {
    icon: HiExclamationTriangle,
    containerClass: "bg-warning/10 border-warning/20",
    iconClass: "text-warning",
  },
  info: {
    icon: HiInformationCircle,
    containerClass: "bg-primary/10 border-primary-light/20",
    iconClass: "text-primary-light",
  },
}

export default function AlertBanner({ 
  title, 
  message, 
  variant = 'danger', 
  actionLabel, 
  onAction 
}) {
  if (!message) return null

  const { icon: Icon, containerClass, iconClass } = variants[variant]

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full p-4 rounded-card border backdrop-blur-md transition-all duration-300 ${containerClass}`}>
      
      {/* Icon & Text Wrapper */}
      <div className="flex items-center gap-4">
        <Icon className={`text-4xl shrink-0 drop-shadow-sm ${iconClass}`} />
        <div className="flex flex-col text-left">
          {title && (
            <span className="font-semibold text-text text-base leading-tight">
              {title}
            </span>
          )}
          <span className="text-text-muted text-sm mt-0.5">
            {message}
          </span>
        </div>
      </div>

      {/* Optional Action Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/5 border border-white/10 transition-colors text-sm font-medium text-text shrink-0"
        >
          {actionLabel}
        </button>
      )}
      
    </div>
  )
}