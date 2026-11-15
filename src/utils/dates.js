// Calendar math on the user's local dates, in place of date-fns (its format() alone pulled in a
// formatting engine and a locale). Each returns a new Date and keeps the time of day.

export const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1)
export const startOfYear = (date) => new Date(date.getFullYear(), 0, 1)

export function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

// Clamped like date-fns: Jan 31 + 1 month is the last day of February, not March 3
export function addMonths(date, months) {
  const next = new Date(date)
  next.setDate(1)
  next.setMonth(next.getMonth() + months)
  next.setDate(Math.min(date.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()))
  return next
}

// The local calendar day as YYYY-MM-DD (toISOString would give the UTC one)
export const toDay = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
