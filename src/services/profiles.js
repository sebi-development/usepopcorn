import supabase from '../lib/supabase'

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, avatar_url, created_at, country')
    .eq('id', userId)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateProfile(updateData, currentUserId) {
  if (Object.keys(updateData).length === 0) {
    throw new Error('At least one field must be provided')
  }

  const { email, password, username, avatar_url, country } = updateData

  if (email !== undefined || password !== undefined) {
    const authUpdates = {}
    if (email !== undefined) authUpdates.email = email
    if (password !== undefined) authUpdates.password = password
    const { error } = await supabase.auth.updateUser(authUpdates)
    if (error) throw new Error(error.message)
  }

  if (username !== undefined || avatar_url !== undefined || country !== undefined) {
    const profileUpdates = {}
    if (username !== undefined) profileUpdates.username = username
    if (avatar_url !== undefined) profileUpdates.avatar_url = avatar_url
    if(country !== undefined) profileUpdates.country = country
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', currentUserId)
    if (error) throw new Error(error.message)
  }
}

export async function searchUsers(query, currentUserId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .ilike('username', `%${query}%`)
    .neq('id', currentUserId)
    .limit(5)
  if (error) throw new Error(error.message)
  return data
}