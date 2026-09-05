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
