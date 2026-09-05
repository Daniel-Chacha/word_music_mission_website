'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/content/types'
import { site } from '@/content/site'
import { formatKes } from '@/lib/format'
import { whatsappLink } from '@/lib/whatsapp'
import { useCart } from '@/lib/cart-store'

export function AddToCart({
  product,
  commerceEnabled,
}: {
  product: Product
  commerceEnabled: boolean
}) {
  const inStock = product.variants.filter((v) => v.inStock)
  const [variantId, setVariantId] = useState(inStock[0]?.id ?? '')
  const [added, setAdded] = useState(false)
  const { add } = useCart()
  const router = useRouter()

  const variant = product.variants.find((v) => v.id === variantId)

  if (inStock.length === 0) {
    return <p className="mt-8 text-bone-dim">Out of stock. Check back soon.</p>
  }

  function orderViaWhatsApp() {
    const message = `Hello Word Mission Team, I would like to order:\n\n${product.name}\nOption: ${variant?.label}\nPrice: ${formatKes(variant?.priceCents ?? 0)}`
    window.open(whatsappLink(site.contact.whatsapp, message), '_blank', 'noopener')
  }

  return (
    <div>
      <p className="mt-8 text-3xl font-black text-gold-500">
        {formatKes(variant?.priceCents ?? 0)}
      </p>

      {product.variants.length > 1 && (
        <fieldset className="mt-8">
          <legend className="eyebrow">Choose an option</legend>
          <div className="mt-4 flex flex-wrap gap-3">
            {product.variants.map((v) => (
              <label
                key={v.id}
                className={`cursor-pointer border px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${
                  variantId === v.id
                    ? 'border-gold-500 bg-gold-500 text-ink-900'
                    : 'border-rule-strong text-bone-dim hover:border-gold-500'
                } ${v.inStock ? '' : 'cursor-not-allowed opacity-40'}`}
              >
                <input
                  type="radio"
                  name="variant"
                  value={v.id}
                  checked={variantId === v.id}
                  disabled={!v.inStock}
                  onChange={() => {
                    setVariantId(v.id)
                    setAdded(false)
                  }}
                  className="sr-only"
                />
                {v.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {commerceEnabled ? (
        <>
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => {
                add({ slug: product.slug, variantId, quantity: 1 })
                setAdded(true)
              }}
              className="bg-gold-500 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-ink-900 transition-colors hover:bg-gold-300"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={() => {
                add({ slug: product.slug, variantId, quantity: 1 })
                router.push('/merch/cart')
              }}
              className="border border-gold-700 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-bone transition-colors hover:border-gold-500"
            >
              Buy now
            </button>
          </div>
          <p aria-live="polite" className="mt-4 text-sm text-gold-300">
            {added ? 'Added to your cart.' : ''}
          </p>
        </>
      ) : (
        <div className="mt-10">
          <button
            type="button"
            onClick={orderViaWhatsApp}
            className="bg-gold-500 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-ink-900 transition-colors hover:bg-gold-300"
          >
            Order on WhatsApp
          </button>
          <p className="mt-4 text-xs text-bone-dim">
            Online payment is coming soon. For now we take orders on WhatsApp and
            confirm delivery with you directly.
          </p>
        </div>
      )}
    </div>
  )
}
