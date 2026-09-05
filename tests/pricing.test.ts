import { describe, it, expect } from 'vitest'
import { priceOrder, SHIPPING_CENTS } from '@/lib/pricing'
import { products } from '@/content/merch'

const tee = products.find((p) => p.slug === 'word-mission-tee')!
const medium = tee.variants.find((v) => v.id === 'm')!

describe('priceOrder', () => {
  it('prices a single line from the catalog', () => {
    const order = priceOrder([{ slug: tee.slug, variantId: 'm', quantity: 2 }])
    expect(order.lines).toHaveLength(1)
    expect(order.lines[0].unitPriceCents).toBe(medium.priceCents)
    expect(order.lines[0].lineTotalCents).toBe(medium.priceCents * 2)
    expect(order.subtotalCents).toBe(medium.priceCents * 2)
    expect(order.totalCents).toBe(medium.priceCents * 2 + SHIPPING_CENTS)
  })

  it('ignores any price supplied by the client', () => {
    // A tampered payload claiming the tee costs one cent.
    const tampered = [
      {
        slug: tee.slug,
        variantId: 'm',
        quantity: 1,
        unitPriceCents: 1,
        lineTotalCents: 1,
      },
    ] as never
    const order = priceOrder(tampered)
    expect(order.lines[0].unitPriceCents).toBe(medium.priceCents)
    expect(order.totalCents).toBe(medium.priceCents + SHIPPING_CENTS)
  })

  it('rejects an unknown product slug but keeps the rest of the cart', () => {
    const order = priceOrder([
      { slug: 'does-not-exist', variantId: 'm', quantity: 1 },
      { slug: tee.slug, variantId: 'm', quantity: 1 },
    ])
    expect(order.rejected).toHaveLength(1)
    expect(order.rejected[0].slug).toBe('does-not-exist')
    expect(order.lines).toHaveLength(1)
  })

  it('rejects an unknown variant', () => {
    const order = priceOrder([{ slug: tee.slug, variantId: 'xxl', quantity: 1 }])
    expect(order.lines).toHaveLength(0)
    expect(order.rejected).toHaveLength(1)
  })

  it('clamps quantity to at least 1 and at most 20', () => {
    expect(
      priceOrder([{ slug: tee.slug, variantId: 'm', quantity: 0 }]).lines[0].quantity,
    ).toBe(1)
    expect(
      priceOrder([{ slug: tee.slug, variantId: 'm', quantity: 999 }]).lines[0].quantity,
    ).toBe(20)
    expect(
      priceOrder([{ slug: tee.slug, variantId: 'm', quantity: -5 }]).lines[0].quantity,
    ).toBe(1)
  })

  it('floors fractional quantities', () => {
    expect(
      priceOrder([{ slug: tee.slug, variantId: 'm', quantity: 2.9 }]).lines[0].quantity,
    ).toBe(2)
  })

  it('treats a non-numeric quantity as one', () => {
    expect(
      priceOrder([{ slug: tee.slug, variantId: 'm', quantity: NaN }]).lines[0].quantity,
    ).toBe(1)
  })

  it('charges no shipping on an empty order', () => {
    const order = priceOrder([])
    expect(order.subtotalCents).toBe(0)
    expect(order.shippingCents).toBe(0)
    expect(order.totalCents).toBe(0)
  })

  it('charges shipping once regardless of line count', () => {
    const order = priceOrder([
      { slug: tee.slug, variantId: 'm', quantity: 1 },
      { slug: tee.slug, variantId: 'l', quantity: 1 },
    ])
    expect(order.shippingCents).toBe(SHIPPING_CENTS)
  })
})
