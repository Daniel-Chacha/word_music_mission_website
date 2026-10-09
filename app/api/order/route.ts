import { NextResponse } from 'next/server'
import { site } from '@/content/site'
import type { CartLine } from '@/content/types'
import { MAX_LINES, priceOrder } from '@/lib/pricing'
import {
  customerOrderEmail,
  isValidEmail,
  isValidName,
  orderReference,
  teamOrderEmail,
  type Customer,
} from '@/lib/emails'
import { isMailConfigured, sendMail, teamInbox } from '@/lib/mail'

const MAX_FIELD = 500

function text(value: unknown, max = MAX_FIELD): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function parseCustomer(value: unknown): Customer | null {
  if (typeof value !== 'object' || value === null) return null
  const c = value as Record<string, unknown>
  const customer: Customer = {
    name: text(c.name),
    email: text(c.email),
    phone: text(c.phone),
    location: text(c.location),
    notes: text(c.notes, 2000),
  }
  const complete =
    isValidName(customer.name) &&
    customer.phone &&
    customer.location &&
    isValidEmail(customer.email)
  return complete ? customer : null
}

export async function POST(request: Request) {
  const fallback = `Please email us at ${site.contact.email.trim()} instead.`

  if (!isMailConfigured()) {
    return NextResponse.json(
      { error: `Online ordering is not available right now. ${fallback}` },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { items, customer: rawCustomer, website } = (body ?? {}) as {
    items?: CartLine[]
    customer?: unknown
    website?: unknown
  }

  // Honeypot: a hidden field people never see but form-filling bots do.
  // Pretend it worked so the bot has nothing to learn from.
  if (typeof website === 'string' && website !== '') {
    return NextResponse.json({ reference: orderReference(), rejected: [] })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
  }
  if (items.length > MAX_LINES) {
    return NextResponse.json({ error: 'Your cart has too many items.' }, { status: 400 })
  }

  const customer = parseCustomer(rawCustomer)
  if (!customer) {
    return NextResponse.json(
      { error: 'Please fill in your name (letters only), a valid email, phone and delivery location.' },
      { status: 400 },
    )
  }

  // Authoritative pricing. Anything the client claimed about money is discarded.
  const order = priceOrder(items)
  if (order.lines.length === 0) {
    return NextResponse.json(
      { error: 'None of the items in your cart are available.' },
      { status: 400 },
    )
  }

  const reference = orderReference()

  // The team's copy is the order record, so failing to send it fails the order.
  try {
    await sendMail(teamInbox(), teamOrderEmail(reference, order, customer), customer.email)
  } catch (cause) {
    console.error('Order email to team failed', cause)
    return NextResponse.json(
      { error: `We could not send your order. Please try again. ${fallback}` },
      { status: 502 },
    )
  }

  // The customer's copy is a courtesy: the team already has the order.
  try {
    await sendMail(
      customer.email,
      customerOrderEmail(reference, order, customer, site.name),
      teamInbox(),
    )
  } catch (cause) {
    console.error(`Confirmation email for ${reference} failed`, cause)
  }

  return NextResponse.json({ reference, rejected: order.rejected })
}
