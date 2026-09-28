// Shared pagination contract. Every source (TMDB, Supabase RPC, Supabase table)
// is adapted to the same page shape so usePagedList / usePagedGrid don't care
// where the data comes from:
//
//   { items, nextCursor, totalPages?, total? }
//
// `nextCursor === undefined` means there is nothing after this page.

// TMDB pages are a fixed 20 items, so PAGE_SIZE matches it and one page size
// works for every list and grid in the app.
export const PAGE_SIZE = 20

// Hard ceiling on how many pages an infinite list may accumulate: bounds
// cache size, DOM nodes and (for realtime lists) refetch cost.
export const MAX_PAGES = 5

// Pages loaded automatically on scroll. Past this, the user has to press
// "Load more", up to MAX_PAGES.
export const AUTO_PAGES = 3

// Explicit cache defaults for the paging hooks (they mirror the global
// defaults in main.jsx). Passing `staleTime: undefined` to React Query would
// override the global default rather than fall back to it, so the hooks
// always resolve to a real value.
export const DEFAULT_STALE_TIME = 1000 * 60 * 5
export const DEFAULT_GC_TIME = 1000 * 60 * 10

// TMDB refuses to serve past page 500 on any endpoint regardless of how many
// total_pages it reports.
const TMDB_MAX_PAGE = 500

// `fetchFn(page)` returns a raw TMDB paginated response.
export function fromTmdb(fetchFn) {
  return async (page) => {
    const response = await fetchFn(page)
    const totalPages = Math.min(response.total_pages ?? 1, TMDB_MAX_PAGE)
    return {
      items: response.results ?? [],
      nextCursor: page < totalPages ? page + 1 : undefined,
      totalPages,
    }
  }
}

const createdAtIdCursor = (row) => ({ created_at: row.created_at, id: row.id })

// Keyset paging for RPCs ordered `created_at DESC, id DESC`.
// `rpcCall({ limit, cursor })` gets `pageSize + 1` rows so a page can tell
// whether more exist without a count query; `cursor` is null for page one.
// Rows may expose the id under a different name (friends ratings use
// `rating_id`), hence `cursorOf`. Never parse created_at into a Date: the
// string PostgREST returned must go back unchanged to keep microseconds.
export function fromCursorRpc(rpcCall, pageSize = PAGE_SIZE, cursorOf = createdAtIdCursor) {
  return async (cursor) => {
    const rows = await rpcCall({ limit: pageSize + 1, cursor })
    const hasMore = rows.length > pageSize
    const items = hasMore ? rows.slice(0, pageSize) : rows
    return {
      items,
      nextCursor: hasMore ? cursorOf(items[items.length - 1]) : undefined,
      // Only RPCs that return it (get_friends_ratings) carry a total
      total: rows[0]?.total_count != null ? Number(rows[0].total_count) : undefined,
    }
  }
}

// Offset paging for numbered grids over a table.
// `rangeCall(from, to)` returns `{ items, count }` (inclusive range).
export function fromRange(rangeCall, pageSize = PAGE_SIZE) {
  return async (page) => {
    const from = (page - 1) * pageSize
    const { items, count } = await rangeCall(from, from + pageSize - 1)
    return {
      items,
      totalPages: Math.max(1, Math.ceil(count / pageSize)),
      total: count,
    }
  }
}
