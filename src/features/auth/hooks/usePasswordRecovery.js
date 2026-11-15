import { useEffect, useState } from "react"
import { openedFromRecoveryLink } from "@/lib/supabase"
import { getSession } from "@/services/session"

export default function usePasswordRecovery() {
  const [isRecoveryReady, setIsRecoveryReady] = useState(false)
  const [isInvalid, setIsInvalid] = useState(!openedFromRecoveryLink)

  useEffect(() => {
    if (!openedFromRecoveryLink) return

    // getSession() waits until the client has finished exchanging the link's tokens, so it
    // works whether init finished before or after this mounts (the one-shot
    // PASSWORD_RECOVERY event can be missed).
    let cancelled = false
    getSession().then((session) => {
      if (cancelled) return
      if (session) setIsRecoveryReady(true)
      else setIsInvalid(true)
    })

    return () => { cancelled = true }
  }, [])

  return { isRecoveryReady, isInvalid }
}
