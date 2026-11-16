const DAY = 864e5
// [unit, its length in days]: the largest one that fits names the age
const AGE_UNITS = [['year', 365], ['month', 30], ['week', 7], ['day', 1]]

// How long ago `date` was, coarse: "today", "5 days", "3 weeks", "3 months", "2 years"
export function timeSince(date) {
  const days = Math.floor((Date.now() - new Date(date)) / DAY)
  if (days < 1) return 'today'
  const [unit, size] = AGE_UNITS.find(([, length]) => days >= length)
  return new Intl.NumberFormat('en', { style: 'unit', unit, unitDisplay: 'long' }).format(Math.floor(days / size))
}

export function timeAgo(dateString) {
  if (!dateString) return ""

  const now = new Date()
  const past = new Date(dateString)
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24

  const elapsed = now - past

  // Fallback for slight clock desyncs between client and server
  if (elapsed < msPerMinute) {
    return "Just now"
  }

  if (elapsed < msPerHour) {
    const mins = Math.round(elapsed / msPerMinute)
    return `${mins}m ago`
  }

  if (elapsed < msPerDay) {
    const hours = Math.round(elapsed / msPerHour)
    return `${hours}h ago`
  }

  // Under a week, show relative days
  if (elapsed < msPerDay * 7) {
    const days = Math.round(elapsed / msPerDay)
    return days === 1 ? "Yesterday" : `${days}d ago`
  }

  // Fallback to a clean date layout for historical data
  return past.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}