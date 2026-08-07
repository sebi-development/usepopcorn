import { useInfiniteQuery } from "@tanstack/react-query";
import { getTrending, getNowPlaying, getPopular } from "../../../services/tmdb";

export function useTrending() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['trending'],
    queryFn: ({ pageParam }) => getTrending(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) return lastPage.page + 1
      return undefined
    }
  })

  return { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage }
}

export function useNowPlaying() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['nowPlaying'],
    queryFn: ({ pageParam }) => getNowPlaying(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) return lastPage.page + 1
      return undefined
    }
  })
  return { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage }
}

export function usePopular() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['popular'],
    queryFn: ({pageParam}) => getPopular(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) return lastPage.page + 1
      return undefined
    }
  })
  return { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage }
}