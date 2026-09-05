import { createHmac, timingSafeEqual } from 'node:crypto'

const PAYSTACK_API = 'https://api.paystack.co'

export function isPaystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY)
}

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not configured')
  return key
}

/**
 * Verifies the `x-paystack-signature` header against the RAW request body.
 *
 * The body must be the exact bytes received. Parsing the JSON and
 * re-serialising it produces different bytes and a failing signature.
 */
export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false

  const expected = createHmac('sha512', secret).update(rawBody).digest('hex')
  // timingSafeEqual throws on a length mismatch, so compare lengths first.
  if (signature.length !== expected.length) return false

  try {
    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex'),
    )
  } catch {
    return false
  }
}

export interface InitializeInput {
  email: string
  /** Integer KES cents. Paystack's `amount` is the currency subunit. */
  amountCents: number
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}

export async function initializeTransaction(input: InitializeInput): Promise<{
  authorizationUrl: string
  reference: string
}> {
  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountCents,
      currency: 'KES',
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  })

  const payload = await response.json()
  if (!response.ok || !payload.status) {
    throw new Error(payload.message ?? 'Paystack initialisation failed')
  }

  return {
    authorizationUrl: payload.data.authorization_url,
    reference: payload.data.reference,
  }
}

export async function verifyTransaction(reference: string): Promise<{
  status: string
  amount: number
  reference: string
}> {
  const response = await fetch(
    `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey()}` } },
  )

  const payload = await response.json()
  if (!response.ok || !payload.status) {
    throw new Error(payload.message ?? 'Paystack verification failed')
  }

  return {
    status: payload.data.status,
    amount: payload.data.amount,
    reference: payload.data.reference,
  }
}
