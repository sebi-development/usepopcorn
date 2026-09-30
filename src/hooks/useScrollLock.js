import { useEffect } from "react"

export function useScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [enabled])
}
