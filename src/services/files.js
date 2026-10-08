import supabase from "@/lib/supabase"

function extractFilePath(url) {
  if (!url) return null
  return url.split('/avatars/')[1]
}

export async function uploadAvatarImage(file, oldAvatarUrl, currentUserId) {
  const fileExt = file.name.split('.').pop()
  const newFilePath = `${currentUserId}/avatar-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(newFilePath, file)
  if (uploadError) throw new Error(uploadError.message)

  if (oldAvatarUrl) {
    const oldPath = extractFilePath(oldAvatarUrl)
    if (oldPath) {
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([oldPath])
      if (deleteError) console.error("Failed to delete old avatar:", deleteError)
    }
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(newFilePath)
  return urlData.publicUrl
}

export async function deleteAvatarImage(url) {
  const path = extractFilePath(url)
  if (!path) return
  const { error } = await supabase.storage
    .from('avatars')
    .remove([path])
  if (error) throw new Error(error.message)
}

// Account deletion: every file in the user's folder, not just the one profiles.avatar_url points
// at (a failed cleanup after an earlier avatar change can leave extras). Must run before the auth
// user is deleted: storage policies need the session. Throws if the API reports fewer removals
// than files found, so a silent policy failure can't loop or leave files behind.
const LIST_PAGE_SIZE = 100

export async function deleteAllAvatarImages(userId) {
  const bucket = supabase.storage.from('avatars')
  for (;;) {
    const { data: files, error: listError } = await bucket.list(userId, { limit: LIST_PAGE_SIZE })
    if (listError) throw new Error(listError.message)
    if (!files.length) return

    const { data: removed, error: removeError } = await bucket.remove(files.map((file) => `${userId}/${file.name}`))
    if (removeError) throw new Error(removeError.message)
    if (removed.length < files.length) throw new Error("Could not remove all avatar files")

    if (files.length < LIST_PAGE_SIZE) return
  }
}
