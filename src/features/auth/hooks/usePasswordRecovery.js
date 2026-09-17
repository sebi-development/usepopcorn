import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function usePasswordRecovery() {
  const [isRecoveryReady, setIsRecoveryReady] = useState(false)
  const [isInvalid] = useState(() => !window.location.hash.includes('type=recovery'))

  useEffect(() => {
    if (isInvalid) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [isInvalid])

  return { isRecoveryReady, isInvalid }
}