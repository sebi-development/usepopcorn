import { Link } from 'react-router'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2'

// The text is a 20px-tall target on its own. Either an invisible ::before pads the tap area to
// 36px without moving anything, or (`stretched`) the ::after covers the nearest positioned
// ancestor, making a whole card the link.
const TAP_AREA = 'relative before:absolute before:-inset-y-2 before:inset-x-0'
const STRETCHED = 'after:absolute after:inset-0 after:z-20'

export default function ArrowLink({ to, direction = 'right', stretched = false, children, className = '', ...props }) {
  const isLeft = direction === 'left'

  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 group transition-colors duration-200 ${stretched ? STRETCHED : TAP_AREA} ${className}`}
      {...props}
    >
      {isLeft && (
        <HiChevronLeft className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
      )}
      <span>{children}</span>
      {!isLeft && (
        <HiChevronRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </Link>
  )
}
