import { inBackground } from "./http.ts";
import { isFresh } from "./ttl.ts";

// The read policy every score function follows (stale-while-revalidate):
//   fresh row                  → answer from the cache
//   expired row that has data  → answer with the old data now, refresh it behind the response
//   no row, or nothing in it   → wait for a fresh lookup
// A background refresh that fails is only logged; one the caller waits for throws to the caller.
export async function staleWhileRevalidate<Row extends { expires_at: string }, Result>(
  row: Row | null,
  { hasData, fromRow, refresh }: {
    hasData: (row: Row) => boolean;
    fromRow: (row: Row) => Result;
    refresh: () => Promise<Result>;
  },
): Promise<Result> {
  if (row && isFresh(row)) return fromRow(row);

  if (row && hasData(row)) {
    inBackground(refresh());
    return fromRow(row);
  }

  return await refresh();
}
