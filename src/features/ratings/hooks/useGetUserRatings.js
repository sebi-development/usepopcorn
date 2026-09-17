import { useQuery } from "@tanstack/react-query";
import { getUserRatings } from "@/services/ratings";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";

export default function useGetUserRatings() {
  const currentUser = useCurrentUser();

  const { data, isLoading, error } = useQuery({
    queryKey: ['ratings', 'user', currentUser?.id],
    queryFn: () => getUserRatings(currentUser?.id),
    enabled: !!currentUser?.id,
  })

  return { data, isLoading, error }
}