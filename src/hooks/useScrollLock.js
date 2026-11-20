import { useEffect } from "react"

// Locks <html>, not <body>: html's overflow-x: clip stops body's overflow from reaching the viewport
export function useScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    const original = root.style.overflow
    root.style.overflow = 'hidden'
    return () => { root.style.overflow = original }
  }, [enabled])
}
