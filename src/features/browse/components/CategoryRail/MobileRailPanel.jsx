import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useScrollLock } from "@/hooks/useScrollLock"

// The rail below md: expanded, over a dimmed page, portalled to body so it also dims the navbar.
// Mounted only while open, so its effects need no "is it open" checks. The page is scroll-locked;
// touch-none on the backdrop and overscroll-contain on the panel keep gestures from leaking through.
// It moves as it opens, so it has no backdrop blur (a moving blur is re-rendered every frame).
export default function MobileRailPanel({ onClose, children }) {
  const panelRef = useRef(null)
  useScrollLock()

  useEffect(() => {
    panelRef.current.focus()
    const onKeyDown = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="md:hidden fixed inset-0 z-50 bg-black/60 touch-none animate-[overlay-fade_200ms_ease-out_both] motion-reduce:animate-none"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Browse categories"
        tabIndex={-1}
        className="
          md:hidden glass-panel backdrop-blur-none! bg-surface-900/95! shadow-xl outline-none
          fixed left-3 top-1/2 -translate-y-1/2 z-50 w-56
          max-h-[calc(100dvh-2rem)]
          flex flex-col gap-1 py-4 px-2 *:shrink-0
          overflow-x-hidden overflow-y-auto overscroll-contain touch-pan-y scrollbar-hide
          animate-[overlay-in_250ms_var(--ease-out-quint)_both] motion-reduce:animate-none
        "
      >
        {children}
      </div>
    </>,
    document.body
  )
}
