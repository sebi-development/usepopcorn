import { HiExclamationCircle, HiInformationCircle, HiExclamationTriangle } from "react-icons/hi2"

const variants = {
  danger: {
    icon: HiExclamationCircle,
    classes: 'bg-danger/10 border-danger/30 text-danger',
  },
  warning: {
    icon: HiExclamationTriangle,
    classes: 'bg-[#ffb400]/10 border-[#ffb400]/30 text-[#ffb400]',
  },
  info: {
    icon: HiInformationCircle,
    classes: 'bg-primary/10 border-primary-light/30 text-primary-light',
  },
}

export default function ErrorBadge({ message, variant = 'warning' }) {
  if (!message) return null
  const { icon: Icon, classes } = variants[variant]

  return (
    <div className={`flex flex-col items-center gap-3 rounded-[0.9rem] border px-4 py-4 ${classes}`}>
      <Icon className="text-3xl shrink-0" />
      <p className="text-sm font-medium text-center leading-relaxed">{message}</p>
    </div>
  )
}