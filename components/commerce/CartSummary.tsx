'use client'

import Link from 'next/link'
import { products } from '@/content/merch'
import { formatKes } from '@/lib/format'
import { SHIPPING_CENTS } from '@/lib/pricing'
import { useCart } from '@/lib/cart-store'

/**
 * Display only. The authoritative total is recomputed server-side in
 * /api/checkout from the catalog — never from anything shown here.
 */
export function CartSummary({ editable = true }: { editable?: boolean }) {
  const { lines, setQuantity, remove, ready } = useCart()

  if (!ready) return <p className="text-bone-dim">Loading your cart…</p>

  if (lines.length === 0) {
    return (
      <div>
        <p className="text-bone-dim">Your cart is empty.</p>
        <Link href="/merch" className="eyebrow mt-4 inline-block hover:text-gold-300">
          Browse the shop
        </Link>
      </div>
    )
  }

  const resolved = lines.flatMap((line) => {
    const product = products.find((p) => p.slug === line.slug)
    const variant = product?.variants.find((v) => v.id === line.variantId)
    if (!product || !variant) return []
    return [{ line, product, variant }]
  })

  const subtotal = resolved.reduce(
    (sum, r) => sum + r.variant.priceCents * r.line.quantity,
    0,
  )

  return (
    <div>
      {resolved.map(({ line, product, variant }) => (
        <div
          key={`${line.slug}-${line.variantId}`}
          className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-600 py-6"
        >
          <div>
            <p className="font-bold">{product.name}</p>
            <p className="eyebrow mt-1">{variant.label}</p>
          </div>

          <div className="flex items-center gap-6">
            {editable ? (
              <label className="flex items-center gap-2 text-sm text-bone-dim">
                <span className="sr-only">
                  Quantity for {product.name}, {variant.label}
                </span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={line.quantity}
                  onChange={(e) =>
                    setQuantity(line.slug, line.variantId, Number(e.target.value))
                  }
                  className="w-16 border border-ink-600 bg-ink-900 px-3 py-2 text-bone"
                />
              </label>
            ) : (
              <span className="text-sm text-bone-dim">× {line.quantity}</span>
            )}

            <span className="font-mono text-gold-300">
              {formatKes(variant.priceCents * line.quantity)}
            </span>

            {editable && (
              <button
                type="button"
                onClick={() => remove(line.slug, line.variantId)}
                className="text-xs uppercase tracking-[0.16em] text-bone-dim hover:text-blood-bright"
              >
                Remove
                <span className="sr-only">
                  {' '}
                  {product.name}, {variant.label}
                </span>
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="border-t border-gold-700/40 pt-6">
        <Row label="Subtotal" value={formatKes(subtotal)} />
        <Row label="Delivery" value={formatKes(SHIPPING_CENTS)} />
        <div className="mt-4 flex justify-between border-t border-ink-600 pt-4">
          <span className="eyebrow">Total</span>
          <span className="font-mono text-2xl font-bold text-gold-500">
            {formatKes(subtotal + SHIPPING_CENTS)}
          </span>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-bone-dim">{label}</span>
      <span className="font-mono text-sm text-bone">{value}</span>
    </div>
  )
}
