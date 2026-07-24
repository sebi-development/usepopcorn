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