import { useState, useCallback, useRef } from "react"

export default function useScrollArrows() {
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)
  
  // Internal refs strictly for cleanup and DOM manipulation
  const cleanupRef = useRef(null)
  const nodeRef = useRef(null) 

  const update = useCallback((el) => {
    if (!el) return
    const hasOverflow = el.scrollWidth > el.clientWidth
    setShowLeft(hasOverflow && Math.ceil(el.scrollLeft) > 0)
    setShowRight(hasOverflow && Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth)
  }, [])

  // The Callback Ref that React will call when the <div> mounts
  const scrollRef = useCallback((el) => {
    // Save the actual DOM node so our custom scrollBy function can use it
    nodeRef.current = el 

    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }

    if (el) {
      update(el)
      const timer = setTimeout(() => update(el), 100)

      // TEAM 2 OPTIMIZATION: Throttled Scroll Listener using RAF
      let isTicking = false
      const handleScroll = () => {
        if (!isTicking) {
          window.requestAnimationFrame(() => {
            update(el)
            isTicking = false
          })
          isTicking = true
        }
      }

      el.addEventListener("scroll", handleScroll, { passive: true })
      window.addEventListener("resize", handleScroll)
      el.addEventListener("load", handleScroll, true)

      const ro = new ResizeObserver(handleScroll)
      const mo = new MutationObserver(handleScroll)
      ro.observe(el)
      mo.observe(el, { childList: true, subtree: true })

      cleanupRef.current = () => {
        clearTimeout(timer)
        el.removeEventListener("scroll", handleScroll)
        window.removeEventListener("resize", handleScroll)
        el.removeEventListener("load", handleScroll, true)
        ro.disconnect()
        mo.disconnect()
      }
    }
  }, [update])
  const scrollByAmount = useCallback((offset) => {
    if (nodeRef.current) {
      nodeRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }, [])

  // Return the DOM ref binder, the UI states, AND the action trigger
  return { showLeft, showRight, scrollRef, scrollByAmount }
}