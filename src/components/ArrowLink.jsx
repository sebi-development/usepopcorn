import { Link } from 'react-router'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2'

export default function ArrowLink({ to, direction = 'right', children, className = '', ...props }) {
  const isLeft = direction === 'left'

  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 group transition-colors duration-200 ${className}`}
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