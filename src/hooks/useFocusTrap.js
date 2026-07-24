import { useEffect } from "react"
import { useRef } from "react"

export function useFocusTrap(isOpen) {
  const ref = useRef(null)

  useEffect(() => {
    if (!isOpen || !ref.current) return

    const modal = ref.current
    const previousFocus = document.activeElement
    
    // 1. find all focusable elements
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    // 2. focus first element on open
    first?.focus()

    // 3. intercept Tab key
    function handleTab(e) {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    // update cleanup
    return () => {
      modal.removeEventListener('keydown', handleTab)
      previousFocus?.focus()
    }

  }, [isOpen])

  return ref
}