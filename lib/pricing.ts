import { products } from '@/content/merch'
import type { CartLine, PricedLine, PricedOrder } from '@/content/types'

/** Flat nationwide delivery. TODO: confirm the real figure with the ministry. */
export const SHIPPING_CENTS = 30000

const MAX_QUANTITY_PER_LINE = 20

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1
  return Math.min(Math.max(Math.floor(quantity), 1), MAX_QUANTITY_PER_LINE)
}

/**
 * Re-prices a cart from the catalog.
 *
 * Only slug, variantId and quantity are read from each line, so any price a
 * client invents is discarded rather than trusted. This function is the sole
 * authority on what an order costs.
 */
export function priceOrder(lines: CartLine[]): PricedOrder {
  const priced: PricedLine[] = []
  const rejected: CartLine[] = []

  for (const line of lines) {
    const product = products.find((p) => p.slug === line.slug)
    const variant = product?.variants.find((v) => v.id === line.variantId)

    if (!product || !variant || !variant.inStock) {
      rejected.push({
        slug: line.slug,
        variantId: line.variantId,
        quantity: line.quantity,
      })
      continue
    }

    const quantity = clampQuantity(line.quantity)
    priced.push({
      slug: product.slug,
      variantId: variant.id,
      quantity,
      name: product.name,
      variantLabel: variant.label,
      unitPriceCents: variant.priceCents,
      lineTotalCents: variant.priceCents * quantity,
    })
  }

  const subtotalCents = priced.reduce((sum, l) => sum + l.lineTotalCents, 0)
  const shippingCents = priced.length > 0 ? SHIPPING_CENTS : 0

  return {
    lines: priced,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    rejected,
  }
}
