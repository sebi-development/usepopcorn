import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleInteraction } from "@/services/interactions"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import toast from "react-hot-toast"

export default function useToggleInteractions(type) {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const queryKey = ['interactions', type, currentUser?.id]

  const { mutate, isPending } = useMutation({
     mutationFn: (mediaData) => toggleInteraction(type, mediaData, currentUser?.id),

    onMutate: async (mediaData) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old) => {
        const normalizedId = mediaData.tmdb_id || mediaData.id
        if (!old) {
          return [{ ...mediaData, tmdb_id: normalizedId, id: 'temp-id', interaction_type: type }]
        }
        const exists = old.some(item => item.tmdb_id === normalizedId)
        return exists
          ? old.filter(item => item.tmdb_id !== normalizedId)
          : [...old, { ...mediaData, tmdb_id: normalizedId, id: 'temp-id', interaction_type: type }]
      })
      return { previous }
    },

    onError: (err, _, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
      toast.error(`Something went wrong: ${err.message}`)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return { mutate, isPending }
}