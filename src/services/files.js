import supabase from "../lib/supabase"

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