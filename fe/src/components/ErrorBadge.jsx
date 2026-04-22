import { HiExclamationCircle, HiInformationCircle, HiExclamationTriangle } from "react-icons/hi2"

const variants = {
  danger: {
    icon: HiExclamationCircle,
    className: 'error-badge--danger',
  },
  warning: {
    icon: HiExclamationTriangle,
    className: 'error-badge--warning',
  },
  info: {
    icon: HiInformationCircle,
    className: 'error-badge--info',
  },
}

function ErrorBadge({ message, variant = 'warning' }) {
  if (!message) return null
  const { icon: Icon, className } = variants[variant]

  return (
    <div className={`error-badge ${className}`}>
      <div className="error-badge__icon-wrap">
        <Icon className="error-badge__icon" />
      </div>
      <p className="error-badge__message">{message}</p>
    </div>
  )
}

export default ErrorBadge