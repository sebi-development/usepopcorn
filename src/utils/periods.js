import { startOfMonth, startOfYear, subMonths } from 'date-fns'

// `start()` is snapped to a calendar boundary so its ISO string stays stable
// for the whole period and is safe to use in a query key.
export const PERIODS = {
  month: { label: 'Month', start: () => startOfMonth(new Date()) },
  halfYear: { label: 'Half Year', start: () => subMonths(startOfMonth(new Date()), 5) },
  year: { label: 'Year', start: () => startOfYear(new Date()) },
}
