import supabase from '@/lib/supabase'
import { signOut } from '@/services/session'
import { deleteAllAvatarImages } from '@/services/files'

// Avatar files first: storage isn't covered by the database cascade, and deleting them needs the session
export async function deleteAccount(userId) {
  await deleteAllAvatarImages(userId)
  const { error } = await supabase.rpc('delete_user')
  if (error) throw new Error(error.message)
  // The account is gone either way, so a sign-out that fails with it is no error
  await signOut().catch(() => {})
}
