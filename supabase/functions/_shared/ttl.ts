// How long a cached score stays fresh, shared by every score function. This table is the policy.
const TTL_DAYS = {
  notFound: 14,
  unrated: 3,
  ratedRecent: 7,
  ratedSettled: 30,
  ratedOld: 90,
};

const DAY_MS = 24 * 60 * 60 * 1000;
const daysFromNow = (days: number) => new Date(Date.now() + days * DAY_MS);

type Result = {
  found: boolean; // the provider knows the title
  rated: boolean; // and has at least one score for it
  year: number | null; // release year, when known
};

export function expiresAt({ found, rated, year }: Result): Date {
  if (!found) return daysFromNow(TTL_DAYS.notFound);
  if (!rated) return daysFromNow(TTL_DAYS.unrated);

  // Unknown year counts as recent: the shorter TTL is the safe side
  const age = year === null ? 0 : new Date().getFullYear() - year;
  if (age <= 1) return daysFromNow(TTL_DAYS.ratedRecent);
  if (age <= 5) return daysFromNow(TTL_DAYS.ratedSettled);
  return daysFromNow(TTL_DAYS.ratedOld);
}

export function isFresh(row: { expires_at: string }): boolean {
  return new Date(row.expires_at).getTime() > Date.now();
}
