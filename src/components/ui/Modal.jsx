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
        className="w-full max-w-md bg-surface-900/60 backdrop-blur-xl border border-primary-light/20 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-8 pb-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-text tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-sm text-text-muted leading-relaxed">{subtitle}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text hover:bg-surface-100/50 transition-all duration-200 rounded-xl p-1.5 mt-0.5 -mr-1"
            aria-label="Close modal"
          >
            <LuX size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 flex flex-col gap-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal