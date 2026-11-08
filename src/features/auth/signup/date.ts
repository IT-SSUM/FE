function formatLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getToday() {
  return formatLocalDate(new Date())
}

export function getYesterday() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return formatLocalDate(yesterday)
}

export function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}
