import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadRating } from "../../../services/ratings"
import useCurrentUser from "../../auth/hooks/useCurrentUser"
import toast from "react-hot-toast"

export default function useUploadRating() {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data) => uploadRating(data, currentUser?.id),
    onMutate: async (data) => {
      const queryKey = ['ratings', 'movie', data.tmdb_id, currentUser?.id]
      await queryClient.cancelQueries({ queryKey })
      const previousRating = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, { ...data, user_id: currentUser?.id })
      return { previousRating, queryKey }
    },
    onSuccess: () => {
      toast.success('Rating added successfully')
    },
    onError: (err, variables, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousRating)
      }
      toast.error(`Error adding rating (${err.message})`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] })
      queryClient.invalidateQueries({ queryKey: ['profileStats', currentUser?.id] })
      queryClient.invalidateQueries({ queryKey: ['profileActivity', currentUser?.id, new Date().getFullYear()] })
    }
  })

  return { mutate, isPending, error }
}