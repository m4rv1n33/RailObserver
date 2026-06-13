export function toDateTimeLocal(date: Date): string {
  const offsetMillis = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offsetMillis).toISOString().slice(0, 16)
}

export function toDateOnly(date: Date): string {
  const offsetMillis = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offsetMillis).toISOString().slice(0, 10)
}
