import { FaTrash } from 'react-icons/fa'
import Tooltip from '../../../components/Tooltip'

function DeleteRating({ onClick, hasRating, className = '' }) {
  if (!hasRating) return <div className="w-7.25" />

  return (
    <Tooltip label="Delete rating" side="bottom">
      <button
        onClick={onClick}
        aria-label="Delete rating"
        className={`
          p-2 rounded-lg transition-colors duration-200 cursor-pointer
          text-text-muted hover:text-red-400/70 hover:bg-red-400/8
          ${className}
        `}
      >
        <FaTrash size={13} />
      </button>
    </Tooltip>
  )
}

export default DeleteRating