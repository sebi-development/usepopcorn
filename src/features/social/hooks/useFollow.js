import { useMutation, useQueryClient } from "@tanstack/react-query"
import { followUser, unfollowUser } from "@/services/follows"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import queryKeys from "@/lib/queryKeys"
import toast from "react-hot-toast"

export default function useFollow(userId) {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  // The followed-ids list (useFollowingIds) is the one source of "am I following X": the profile
  // button and the community widgets all read it, so a single optimistic patch updates them all.
  const queryKey = queryKeys.followingIds(currentUser?.id)

  const { mutate, isPending } = useMutation({
    mutationFn: (isFollowing) => isFollowing
      ? unfollowUser(currentUser?.id, userId)
      : followUser(currentUser?.id, userId),

    onMutate: async (isFollowing) => {
      await queryClient.cancelQueries({ queryKey })
      const previousIds = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old
        return isFollowing ? old.filter((id) => id !== userId) : [...old, userId]
      })
      return { previousIds }
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousIds)
      toast.error("Network error. Could not update follow status.")
    },

    onSettled: () => {
      const me = currentUser?.id
      queryClient.invalidateQueries({ queryKey: queryKeys.followingIds(me) })
      queryClient.invalidateQueries({ queryKey: queryKeys.feed(me) })
      queryClient.invalidateQueries({ queryKey: queryKeys.suggestedUsers(me) })
      // Whose ratings count as "friends" on every detail page just changed
      queryClient.invalidateQueries({ queryKey: queryKeys.friendsRatings.all(me) })
    }
  })
  return { mutate, isPending }
}
