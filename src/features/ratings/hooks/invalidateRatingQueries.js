import queryKeys from "@/lib/queryKeys"

// Everything a rating write changes for its author: the lists, averages and picks under
// ratings.all, the own-score chips, and the stats / heatmap / streak aggregates.
// The heatmap is refreshed for every year: a deleted rating may have been created in an earlier one.
export default function invalidateRatingQueries(queryClient, userId) {
  queryClient.invalidateQueries({ queryKey: queryKeys.ratings.all })
  queryClient.invalidateQueries({ queryKey: queryKeys.mediaState(userId) })
  queryClient.invalidateQueries({ queryKey: queryKeys.profileStats(userId) })
  queryClient.invalidateQueries({ queryKey: queryKeys.profileActivity.all(userId) })
  queryClient.invalidateQueries({ queryKey: queryKeys.profileStreak(userId) })
  queryClient.invalidateQueries({ queryKey: queryKeys.extendedStreak(userId) })
}
