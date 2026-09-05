import { randomUUID } from 'node:crypto'
import { getDb, isFirebaseConfigured } from './firebase'
import { isPaystackConfigured } from './paystack'
import type { PricedLine } from '@/content/types'

export type OrderStatus = 'pending' | 'paid' | 'failed'

export interface Customer {
  name: string
  email: string
  phone: string
  location: string
  notes?: string
}

export interface Order {
  reference: string
  status: OrderStatus
  lines: PricedLine[]
  subtotalCents: number
  shippingCents: number
  totalCents: number
  customer: Customer
  createdAt: string
  paidAt?: string
  paystackReference?: string
}

const COLLECTION = 'orders'

/** Online checkout needs both integrations. Either missing → WhatsApp ordering. */
export function isCommerceEnabled(): boolean {
  return isPaystackConfigured() && isFirebaseConfigured()
}

export async function createPendingOrder(input: {
  lines: PricedLine[]
  subtotalCents: number
  shippingCents: number
  totalCents: number
  customer: Customer
}): Promise<string> {
  const reference = `WMT-${Date.now().toString(36).toUpperCase()}-${randomUUID()
    .slice(0, 8)
    .toUpperCase()}`

  const order: Order = {
    reference,
    status: 'pending',
    ...input,
    createdAt: new Date().toISOString(),
  }

  await getDb().collection(COLLECTION).doc(reference).set(order)
  return reference
}

/**
 * Idempotent. Paystack retries webhooks, so a repeat call for an order that is
 * already paid reports 'already-paid' and writes nothing.
 */
export async function markOrderPaid(
  reference: string,
  paystackReference: string,
): Promise<'updated' | 'already-paid' | 'not-found'> {
  const db = getDb()
  const ref = db.collection(COLLECTION).doc(reference)

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists) return 'not-found' as const
    if (snapshot.get('status') === 'paid') return 'already-paid' as const

    transaction.update(ref, {
      status: 'paid',
      paidAt: new Date().toISOString(),
      paystackReference,
    })
    return 'updated' as const
  })
}

export async function getOrder(reference: string): Promise<Order | null> {
  const snapshot = await getDb().collection(COLLECTION).doc(reference).get()
  return snapshot.exists ? (snapshot.data() as Order) : null
}

export async function listOrders(limit = 100): Promise<Order[]> {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()
  return snapshot.docs.map((doc) => doc.data() as Order)
}
