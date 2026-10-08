/**
 * Formats integer KES cents as a display string.
 *
 * Intl.NumberFormat is deliberately avoided: its `KES` output (symbol choice,
 * placement, forced 2 decimals) differs between Node and browser ICU builds,
 * which would make the same price render differently on server and client.
 */
export function formatKes(cents: number): string {
  const whole = Math.trunc(cents / 100)
  const remainder = Math.abs(cents % 100)
  const grouped = whole.toLocaleString('en-US')
  return remainder === 0
    ? `KES ${grouped}`
    : `KES ${grouped}.${String(remainder).padStart(2, '0')}`
}

/** Formats an ISO date (YYYY-MM-DD) as "14 March 2026". Always UTC. */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Formats an <input type="datetime-local"> value ("2026-10-20T10:30") as
 * "Tuesday 20 October 2026, 10:30". The clock time is kept exactly as typed:
 * the value has no timezone, so it is read as UTC and printed as UTC.
 * Anything that is not such a value is returned unchanged.
 */
export function formatDateTimeLocal(value: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(value)
  if (!match) return value
  const [, date, time] = match
  const day = new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  return `${day.replace(',', '')}, ${time}`
}
