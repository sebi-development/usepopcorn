import { createPortal } from 'react-dom'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { useScrollLock } from '@/hooks/useScrollLock'

function SearchOverlay({ onClose, children }) {
  const ref = useOutsideClick(onClose)

  useScrollLock()

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[12vh] animate-[overlay-fade_200ms_ease-out_both]">
      <div
        ref={ref}
        className="w-full max-w-3xl bg-surface-500 border border-surface-100 rounded-card shadow-2xl overflow-hidden animate-[overlay-in_250ms_ease-out_both]"
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

export default SearchOverlay