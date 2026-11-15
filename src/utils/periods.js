import { addMonths, startOfMonth, startOfYear } from '@/utils/dates'

// `start()` is snapped to a calendar boundary so its ISO string stays stable
// for the whole period and is safe to use in a query key.
export const PERIODS = {
  month: { label: 'Month', start: () => startOfMonth(new Date()) },
  quarter: { label: 'Quarter', start: () => addMonths(startOfMonth(new Date()), -2) },
  halfYear: { label: 'Half Year', start: () => addMonths(startOfMonth(new Date()), -5) },
  // Rolling 12 calendar months, unlike `year` (calendar year to date), which is nearly empty in January
  twelveMonths: { label: 'Twelve Months', start: () => addMonths(startOfMonth(new Date()), -11) },
  year: { label: 'Year', start: () => startOfYear(new Date()) },
}
