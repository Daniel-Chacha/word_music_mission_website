import type { PricedOrder } from '@/content/types'
import { formatKes } from './format'

export interface Customer {
  name: string
  email: string
  phone: string
  location: string
  notes?: string
}

export interface EmailContent {
  subject: string
  text: string
  html: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value)
}

/**
 * Letters, spaces and . ' - only. The name is the one piece of customer text
 * that reaches the customer's own inbox, so it must not be able to carry a
 * link or a message.
 */
const NAME_PATTERN = /^[\p{L}\p{M} .'-]{1,80}$/u

export function isValidName(value: string): boolean {
  return NAME_PATTERN.test(value)
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Renders form fields as labelled lines, skipping blanks. */
export function buildEnquiry(fields: Record<string, string>): string {
  return Object.entries(fields)
    .filter(([, value]) => value.trim() !== '')
    .map(([label, value]) => `${label}: ${value.trim()}`)
    .join('\n')
}

/** `WMT-<time>-<random>`: short enough to read out over the phone. */
export function orderReference(now = Date.now(), random = Math.random()): string {
  const suffix = Math.floor(random * 36 ** 4)
    .toString(36)
    .padStart(4, '0')
  return `WMT-${now.toString(36)}-${suffix}`.toUpperCase()
}

function orderLines(order: PricedOrder): string[] {
  return [
    ...order.lines.map(
      (l) => `${l.name} · ${l.variantLabel} × ${l.quantity} — ${formatKes(l.lineTotalCents)}`,
    ),
    '',
    `Subtotal: ${formatKes(order.subtotalCents)}`,
    `Delivery: ${formatKes(order.shippingCents)}`,
    `Total: ${formatKes(order.totalCents)}`,
  ]
}

function toHtml(text: string): string {
  return `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(text)}</div>`
}

/** The email the team receives. Replying goes straight to the customer. */
export function teamOrderEmail(
  reference: string,
  order: PricedOrder,
  customer: Customer,
): EmailContent {
  const text = [
    `New shop order ${reference}`,
    '',
    'CUSTOMER',
    buildEnquiry({
      Name: customer.name,
      Phone: customer.phone,
      Email: customer.email,
      'Delivery location': customer.location,
      Notes: customer.notes ?? '',
    }),
    '',
    'ORDER',
    ...orderLines(order),
    '',
    'Next step: contact the customer to arrange delivery and share payment details.',
  ].join('\n')

  return { subject: `New order ${reference} — ${customer.name}`, text, html: toHtml(text) }
}

/**
 * The confirmation the customer receives.
 *
 * Anyone can type any address into checkout, so this goes to an unverified
 * inbox. It therefore carries only catalogue data and the reference, plus a
 * name already restricted by isValidName — never the free-text location,
 * phone or notes, which would let someone send arbitrary text from our account.
 */
export function customerOrderEmail(
  reference: string,
  order: PricedOrder,
  customer: Customer,
  teamName: string,
): EmailContent {
  const text = [
    `Hello ${customer.name},`,
    '',
    `Thank you for your order. We have received it, and a member of ${teamName} will contact you by phone or email to arrange delivery and share payment details.`,
    '',
    `Order reference: ${reference}`,
    '',
    ...orderLines(order),
    '',
    'God bless you,',
    teamName,
  ].join('\n')

  return { subject: `Your order ${reference} — ${teamName}`, text, html: toHtml(text) }
}

/** A contact-page form submission, sent to the team. */
export function contactEmail(
  preamble: string,
  fields: Record<string, string>,
): EmailContent {
  const text = `${preamble}\n\n${buildEnquiry(fields)}`
  return { subject: `Website: ${preamble.toLowerCase()}`, text, html: toHtml(text) }
}
