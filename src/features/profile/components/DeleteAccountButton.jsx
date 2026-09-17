import { useState } from "react";
import Button from "@/components/ui/Button";
import { LuLoaderCircle } from "react-icons/lu"
import supabase from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from 'react-router'

export default function DeleteAccountButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const { error } = await supabase.rpc('delete_user')
      if (error) throw error
      await supabase.auth.signOut()
      queryClient.clear()
      await supabase.removeAllChannels()
      navigate('/', { replace: true })
    } catch (error) {
      console.error("Failed to delete account:", error)
      alert("An error occurred while deleting your account.")
      setIsDeleting(false)
    }
  }

  if (isDeleting) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <LuLoaderCircle className="w-8 h-8 text-red-500 animate-spin" />
        <p className="text-sm font-medium text-text-muted animate-pulse">
          Securely erasing account data...
        </p>
      </div>
    )
  }

  if (isConfirming) {
    return (
      <div className="w-full mt-6 rounded-xl border border-red-500/10 bg-red-500/5 p-4 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-2">
        <div className="text-sm text-center">
          <h4 className="text-red-400 font-medium mb-1">Are you absolutely sure?</h4>
          <p className="text-text-muted text-xs">This action cannot be undone.</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button
            variant="secondary"
            className="flex-1 py-2 text-xs font-semibold"
            onClick={() => setIsConfirming(false)}
            disabled={isDeleting}
            type="button"
          >
            No, cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1 py-2 text-xs font-semibold"
            onClick={handleDelete}
            isLoading={isDeleting}
            type="button"
          >
            Yes, delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 pt-6 border-t border-white/10">
      <Button
        variant="danger"
        className="w-full py-2.5 text-sm font-semibold"
        onClick={() => setIsConfirming(true)}
        type="button"
      >
        Delete Account
      </Button>
    </div>
  );
}
