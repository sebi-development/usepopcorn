import { useCallback } from "react"
import { createPortal } from "react-dom"
import { LuX } from "react-icons/lu"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import useKey from "@/hooks/useKey"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import { useScrollLock } from "@/hooks/useScrollLock"
import mergeRefs from "@/utils/mergeRefs"

function Modal({ title, subtitle, onClose, children }) {
  const handleClose = useCallback(() => onClose(), [onClose])

  const outsideClickRef = useOutsideClick(handleClose)
  const focusTrapRef = useFocusTrap(true)

  useKey('Escape', handleClose)
  useScrollLock()

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div
        ref={mergeRefs(outsideClickRef, focusTrapRef)}
        // Taller than the screen (small phones, long forms): the panel scrolls instead of being cut off
        className="w-full max-w-md max-h-full overflow-y-auto overscroll-contain bg-surface-900/60 backdrop-blur-xl border border-primary-light/20 rounded-3xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-text tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-sm text-text-muted leading-relaxed">{subtitle}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text hover:bg-surface-100/50 transition-all duration-200 rounded-xl shrink-0 flex items-center justify-center w-11 h-11 -mt-2 -mr-3 md:w-auto md:h-auto md:p-1.5 md:mt-0.5 md:-mr-1"
            aria-label="Close modal"
          >
            <LuX size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-6 sm:px-8 sm:pb-8 flex flex-col gap-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal