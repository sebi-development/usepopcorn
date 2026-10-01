// The fields cards, search results and suggestions read from a TMDB list item. Everything else
// (overview, backdrop_path, original_title, popularity, vote_count…) is dropped before the item
// reaches the cache: lists hold up to 100 of these each.
// Movies carry title / release_date, series name / first_air_date; both land in the same fields.
export function toMediaItem(item) {
  return {
    id: item.id,
    media_type: item.media_type,
    title: item.title || item.name,
    poster_path: item.poster_path,
    release_date: item.release_date || item.first_air_date,
    vote_average: item.vote_average,
    genre_ids: item.genre_ids,
    adult: item.adult,
  }
}
