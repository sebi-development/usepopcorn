import { useQueryClient } from "@tanstack/react-query"

export default function useCurrentUser() {
  const queryClient = useQueryClient()
  return queryClient.getQueryData(['currentUser'])
}