import { useCallback } from "react"
import { createPortal } from "react-dom"
import { useFocusTrap } from "../hooks/useFocusTrap"
import useKey from "../hooks/useKey"
import { useOutsideClick } from "../hooks/useOutsideClick"
import { useScrollLock } from "../hooks/useScrollLock"
import mergeRefs from "../utils/mergeRefs"

function Modal({ title, onClose, children }) {
  const handleClose = useCallback(() => onClose(), [onClose])

  const outsideClickRef = useOutsideClick(handleClose)
  const focusTrapRef = useFocusTrap(true)

  useKey('Escape', handleClose)
  useScrollLock()

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div
        ref={mergeRefs(outsideClickRef, focusTrapRef)}
        className="w-full max-w-lg bg-surface-500 border border-surface-100 rounded-card shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="text-text font-semibold text-lg">{title}</h2>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal