import { useRef } from "react"
import { useEffect } from "react"

export default function useIntersectionObserver(callback, options = {}) {
    // 1. create a ref for the sentinel
    const ref = useRef(null)

    // 2. set up the observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                callback()  
            }
        }, { rootMargin: '200px', ...options })

        if (ref.current) observer.observe(ref.current)

        // 3. cleanup
        return () => observer.disconnect()
    }, [callback, options])

    // 4. return ref so component can attach it to sentinel
    return ref
}