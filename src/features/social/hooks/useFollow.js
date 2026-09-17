import { useMutation, useQueryClient } from "@tanstack/react-query"
import { followUser, unfollowUser } from "@/services/follows"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import toast from "react-hot-toast"

export default function useFollow(userId) {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const queryKey = ['profileRelationship', userId, currentUser?.id]

  const { mutate, isPending } = useMutation({
    mutationFn: (isFollowing) => isFollowing
      ? unfollowUser(currentUser?.id, userId)
      : followUser(currentUser?.id, userId),

    onMutate: async (isFollowing) => {
      await queryClient.cancelQueries({ queryKey })
      const previousRelationship = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          isFollowing: !isFollowing,
          followers: isFollowing ? old.followers - 1 : old.followers + 1
        }
      })
      return { previousRelationship }
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKey, context.previousRelationship)
      toast.error("Network error. Could not update follow status.")
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profileRelationship', userId, currentUser?.id] })
      queryClient.invalidateQueries({ queryKey: ['isFollowing', currentUser?.id, userId] })
      queryClient.invalidateQueries({ queryKey: ['feed', currentUser?.id] })
      queryClient.invalidateQueries({ queryKey: ['suggested', currentUser?.id] })
    }
  })
  return { mutate, isPending }
}