export const formatDateTime = (dateValue) => {
  if (!dateValue) return '-'

  const formatted = new Date(dateValue).toLocaleString('en-MY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  return formatted.replace(
    /\b(am|pm)\b/gi,
    period => period.toUpperCase()
  )
}

export const formatTime = (dateValue) => {
  if (!dateValue) return '-'

  const formatted = new Date(dateValue).toLocaleTimeString('en-MY', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  return formatted.replace(
    /\b(am|pm)\b/gi,
    period => period.toUpperCase()
  )
}
