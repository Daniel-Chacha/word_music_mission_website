const KENYA_CODE = '254'

/** Normalises a Kenyan phone number to digits-only international form. */
export function normalisePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('0')) return KENYA_CODE + digits.slice(1)
  return digits
}

/** Builds a wa.me deep link with a pre-filled message. */
export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${normalisePhone(phone)}?text=${encodeURIComponent(message)}`
}

/** Renders form fields as labelled lines, skipping blanks. */
export function buildEnquiry(fields: Record<string, string>): string {
  return Object.entries(fields)
    .filter(([, value]) => value.trim() !== '')
    .map(([label, value]) => `${label}: ${value.trim()}`)
    .join('\n')
}
