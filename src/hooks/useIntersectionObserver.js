import { useRef } from "react"
import { useEffect } from "react"

export default function useIntersectionObserver(callback, { root = null, rootMargin = '200px', threshold = 0 } = {}) {
    // 1. create a ref for the sentinel
    const ref = useRef(null)
    const callbackRef = useRef(callback)

    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    // 2. set up the observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                callbackRef.current()  
            }
        }, { root, rootMargin, threshold })

        if (ref.current) observer.observe(ref.current)

        // 3. cleanup
        return () => observer.disconnect()
    }, [root, rootMargin, threshold])

    // 4. return ref so component can attach it to sentinel
    return ref
}