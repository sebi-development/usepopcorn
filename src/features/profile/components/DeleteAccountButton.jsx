import { useState } from "react"
import { LuLoaderCircle } from "react-icons/lu"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import toast from "react-hot-toast"
import Button from "@/components/ui/Button"
import InfoNote from "@/components/ui/InfoNote"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { deleteAccount } from "@/services/account"

const CARD_CLASS = "rounded-xl border border-red-500/15 bg-red-500/4 p-4"
const TITLE_CLASS = "text-sm font-semibold leading-snug tracking-tight text-white"

export default function DeleteAccountButton() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const navigate = useNavigate()

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteAccount(currentUser.id)
      queryClient.clear()
      navigate('/', { replace: true })
      toast.success("Your account has been deleted.")
    } catch (error) {
      console.error("Failed to delete account:", error)
      toast.error("An error occurred while deleting your account.")
      setIsDeleting(false)
    }
  }

  if (isDeleting) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <LuLoaderCircle className="w-8 h-8 text-red-500 animate-spin" />
        <p className="text-xs font-medium text-text-muted">
          Securely erasing account data...
        </p>
      </div>
    )
  }

  if (isConfirming) {
    return (
      <div className={`${CARD_CLASS} flex flex-col gap-4`}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className={TITLE_CLASS}>Delete your account?</h3>
          <InfoNote>This action cannot be undone.</InfoNote>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 min-h-11 sm:min-h-0 font-semibold"
            onClick={() => setIsConfirming(false)}
            type="button"
          >
            Keep account
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1 min-h-11 sm:min-h-0 font-semibold"
            onClick={handleDelete}
            type="button"
          >
            Yes, delete
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${CARD_CLASS} flex items-center justify-between gap-3 sm:gap-4`}>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className={TITLE_CLASS}>Delete account</h3>
        <p className="text-xs leading-relaxed text-text-muted">Permanently remove your account.</p>
      </div>
      <Button
        variant="danger"
        size="sm"
        className="shrink-0 min-h-11 sm:min-h-0"
        onClick={() => setIsConfirming(true)}
        type="button"
      >
        Delete
      </Button>
    </div>
  )
}
