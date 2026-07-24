import { useQuery } from "@tanstack/react-query";
import { getUserRatings } from "../../../services/ratings";

export default function useGetUserRatings() {


  const { data, isLoading, error } = useQuery({
    queryKey: ['ratings', 'user'],
    queryFn: getUserRatings
  })

  return { data, isLoading, error }
}