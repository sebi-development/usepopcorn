// Every React Query key in the app is built here. Queries, optimistic updates, realtime
// invalidations and prefetches all go through this factory, so a query and whatever refreshes it
// cannot drift apart (ESLint rejects an inline `queryKey: [...]` anywhere else).
//
// Keys run from general to specific: invalidating a shorter key refreshes everything under it,
// e.g. `ratings.all` covers averages, a user's rating pages and the best-rated picks.
const queryKeys = {
  currentUser: ['currentUser'],

  // ── Signed-in user's titles ──────────────────────────────────
  mediaState: (userId) => ['mediaState', userId],
  interactions: (type, userId) => ['interactions', type, userId],

  // ── Profiles ─────────────────────────────────────────────────
  profile: (userId) => ['profile', userId],
  profileStats: (userId) => ['profileStats', userId],
  profileActivity: {
    all: (userId) => ['profileActivity', userId],
    byYear: (userId, year) => ['profileActivity', userId, year],
  },
  profileStreak: (userId) => ['profileStreak', userId],
  extendedStreak: (userId) => ['extendedStreak', userId],

  // ── Ratings ──────────────────────────────────────────────────
  ratings: {
    all: ['ratings'],
    average: (tmdbId) => ['ratings', 'average', tmdbId],
    // Base of a user's numbered rating pages (see gridPage)
    byUser: (userId) => ['ratings', 'user', userId],
    bestRated: (userId, period) => ['ratings', 'bestRated', userId, period],
  },

  // ── Social ───────────────────────────────────────────────────
  followingIds: (userId) => ['followingIds', userId],
  suggestedUsers: (userId) => ['suggested', userId],
  feed: (userId) => ['feed', userId],
  friendsRatings: {
    // User first, so following / unfollowing someone can refresh every title at once
    all: (userId) => ['friendsRatings', userId],
    byTitle: (userId, tmdbId) => ['friendsRatings', userId, tmdbId],
  },

  // ── Search ───────────────────────────────────────────────────
  search: {
    media: (type, query) => ['search', type, query],
    users: (query) => ['users', 'search', query],
  },

  // ── TMDB / OMDb ──────────────────────────────────────────────
  media: {
    details: (type, tmdbId, country) => ['mediaDetails', type, tmdbId, country],
    season: (tvId, seasonNumber) => ['seasonDetails', tvId, seasonNumber],
    externalScores: (imdbId) => ['externalScores', imdbId],
    recommendations: (tmdbId, type) => ['recommendations', tmdbId, type],
    category: (type, categoryId) => ['browse', categoryId, type],
    genre: (type, genreId) => ['browse', 'genre', type, genreId],
  },

  // One numbered page of a grid whose base key is `base` (usePagedGrid). A row that shows the
  // first page of the same data uses gridPage(base, 1) so expanding it is a cache hit.
  gridPage: (base, page) => [...base, 'grid', page],
}

export default queryKeys
