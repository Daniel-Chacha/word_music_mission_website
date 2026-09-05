import { NextResponse } from 'next/server'
import { verifyPaystackSignature } from '@/lib/paystack'
import { markOrderPaid } from '@/lib/orders'

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  // Raw body first. Parsing and re-serialising would change the bytes and
  // break the HMAC.
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  if (!verifyPaystackSignature(rawBody, signature, secret)) {
    console.warn('Rejected Paystack webhook with an invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { event?: string; data?: { reference?: string; status?: string } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (event.event !== 'charge.success') {
    // Acknowledge events we do not act on so Paystack stops retrying them.
    return NextResponse.json({ received: true })
  }

  const reference = event.data?.reference
  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
  }

  try {
    const result = await markOrderPaid(reference, reference)
    if (result === 'not-found') {
      console.error(`Paystack webhook for unknown order ${reference}`)
    }
    // 'already-paid' is a normal retry — acknowledge it as success.
    return NextResponse.json({ received: true, result })
  } catch (cause) {
    console.error('Failed to record payment', cause)
    // A 500 makes Paystack retry, which is what we want on a transient failure.
    return NextResponse.json({ error: 'Could not record payment' }, { status: 500 })
  }
}
