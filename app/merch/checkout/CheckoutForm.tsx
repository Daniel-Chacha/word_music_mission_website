'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Field } from '@/components/ui/Field'
import { useCart } from '@/lib/cart-store'

export function CheckoutForm() {
  const { lines, ready } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (ready && lines.length === 0) {
    return (
      <div>
        <p className="text-bone-dim">Your cart is empty.</p>
        <Link href="/merch" className="eyebrow mt-4 inline-block hover:text-gold-300">
          Browse the shop
        </Link>
      </div>
    )
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const data = new FormData(event.currentTarget)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Only identifiers are sent. The server prices the order.
          items: lines.map((l) => ({
            slug: l.slug,
            variantId: l.variantId,
            quantity: l.quantity,
          })),
          customer: {
            name: String(data.get('name') ?? ''),
            email: String(data.get('email') ?? ''),
            phone: String(data.get('phone') ?? ''),
            location: String(data.get('location') ?? ''),
            notes: String(data.get('notes') ?? ''),
          },
        }),
      })

      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? 'Checkout failed')

      router.push(payload.authorizationUrl)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Something went wrong. Please try again.',
      )
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-6">
        <Field label="Full name" name="name" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone (M-Pesa)" name="phone" type="tel" required />
        <Field label="Delivery location" name="location" required />
        <Field label="Delivery notes" name="notes" rows={3} />
      </div>

      {error && (
        <div role="alert" className="surface-card mt-8 border-danger-border p-5">
          <p className="text-sm text-blood-bright">{error}</p>
          <p className="mt-2 text-sm text-bone-dim">
            You can also order on WhatsApp from any product page.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-10 w-full bg-gold-500 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-ink-900 transition-colors hover:bg-gold-300 disabled:opacity-50"
      >
        {submitting ? 'Redirecting to payment…' : 'Pay with M-Pesa or card'}
      </button>

      <p className="mt-4 text-center text-xs text-bone-dim">
        You will be redirected to Paystack to complete payment securely. We never see
        or store your card details.
      </p>
    </form>
  )
}
