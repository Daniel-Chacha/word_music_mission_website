import { NextResponse } from 'next/server'
import { priceOrder } from '@/lib/pricing'
import { createPendingOrder, isCommerceEnabled, type Customer } from '@/lib/orders'
import { initializeTransaction } from '@/lib/paystack'
import type { CartLine } from '@/content/types'

function isValidCustomer(value: unknown): value is Customer {
  if (typeof value !== 'object' || value === null) return false
  const c = value as Record<string, unknown>
  return (
    typeof c.name === 'string' &&
    c.name.trim() !== '' &&
    typeof c.email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) &&
    typeof c.phone === 'string' &&
    c.phone.trim() !== '' &&
    typeof c.location === 'string' &&
    c.location.trim() !== ''
  )
}

export async function POST(request: Request) {
  if (!isCommerceEnabled()) {
    return NextResponse.json(
      { error: 'Online payment is not available yet. Please order on WhatsApp.' },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { items, customer } = (body ?? {}) as {
    items?: CartLine[]
    customer?: unknown
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
  }

  if (!isValidCustomer(customer)) {
    return NextResponse.json(
      { error: 'Please fill in your name, a valid email, phone and location.' },
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

  try {
    const reference = await createPendingOrder({
      lines: order.lines,
      subtotalCents: order.subtotalCents,
      shippingCents: order.shippingCents,
      totalCents: order.totalCents,
      customer,
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin

    const { authorizationUrl } = await initializeTransaction({
      email: customer.email,
      amountCents: order.totalCents,
      reference,
      callbackUrl: `${siteUrl}/merch/order/${reference}`,
      metadata: { reference, customerName: customer.name },
    })

    return NextResponse.json({
      authorizationUrl,
      reference,
      rejected: order.rejected,
    })
  } catch (cause) {
    console.error('Checkout failed', cause)
    return NextResponse.json(
      {
        error:
          'We could not start your payment. Please try again, or order on WhatsApp.',
      },
      { status: 502 },
    )
  }
}
