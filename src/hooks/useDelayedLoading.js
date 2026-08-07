import { useState, useEffect } from 'react'

export default function useDelayedLoading(isLoading, delayMs = 150) {
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    if (!isLoading) return

    const timer = setTimeout(() => setShowLoading(true), delayMs)
    return () => {
      clearTimeout(timer)
      setShowLoading(false)
    }
  }, [isLoading, delayMs])

  return showLoading
}