import { useQuery } from "@tanstack/react-query"
import { getProfileRelationship } from "../../../services/follows"

export default function useProfileRelationship(targetUserId, currentUserId) {
  const { data, isLoading } = useQuery({
    queryKey: ['profileRelationship', targetUserId],
    queryFn: () => getProfileRelationship(currentUserId, targetUserId),
    enabled: !!targetUserId && !!currentUserId,
  })
  return { data, isLoading }
}