import { useState, useEffect } from "react"

export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(function () {
    const timer = setTimeout(function () {
      setDebouncedValue(value)
    }, delay)

    return function () {
      clearTimeout(timer)
    }

  }, [value, delay])

  return debouncedValue
}