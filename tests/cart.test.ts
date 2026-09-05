import { describe, it, expect } from 'vitest'
import { cartReducer, serialiseCart, deserialiseCart } from '@/lib/cart'
import type { CartLine } from '@/content/types'

const tee: CartLine = { slug: 'word-mission-tee', variantId: 'm', quantity: 1 }

describe('cartReducer', () => {
  it('adds a line to an empty cart', () => {
    expect(cartReducer([], { type: 'add', line: tee })).toEqual([tee])
  })

  it('merges quantity when the same variant is added twice', () => {
    const once = cartReducer([], { type: 'add', line: tee })
    const twice = cartReducer(once, { type: 'add', line: tee })
    expect(twice).toHaveLength(1)
    expect(twice[0].quantity).toBe(2)
  })

  it('keeps different variants of the same product separate', () => {
    const withM = cartReducer([], { type: 'add', line: tee })
    const withL = cartReducer(withM, { type: 'add', line: { ...tee, variantId: 'l' } })
    expect(withL).toHaveLength(2)
  })

  it('removes a specific variant only', () => {
    const state = [tee, { ...tee, variantId: 'l' }]
    const result = cartReducer(state, {
      type: 'remove',
      slug: tee.slug,
      variantId: 'm',
    })
    expect(result).toEqual([{ ...tee, variantId: 'l' }])
  })

  it('sets a quantity', () => {
    const result = cartReducer([tee], {
      type: 'setQuantity',
      slug: tee.slug,
      variantId: 'm',
      quantity: 5,
    })
    expect(result[0].quantity).toBe(5)
  })

  it('removes the line when quantity is set to zero', () => {
    const result = cartReducer([tee], {
      type: 'setQuantity',
      slug: tee.slug,
      variantId: 'm',
      quantity: 0,
    })
    expect(result).toEqual([])
  })

  it('clears the cart', () => {
    expect(cartReducer([tee], { type: 'clear' })).toEqual([])
  })

  it('replaces the cart wholesale on restore', () => {
    expect(cartReducer([tee], { type: 'restore', lines: [] })).toEqual([])
  })

  it('does not mutate the previous state', () => {
    const state = [tee]
    cartReducer(state, { type: 'add', line: tee })
    expect(state[0].quantity).toBe(1)
  })
})

describe('cart storage', () => {
  it('round-trips through storage', () => {
    expect(deserialiseCart(serialiseCart([tee]))).toEqual([tee])
  })

  it('returns an empty cart for null', () => {
    expect(deserialiseCart(null)).toEqual([])
  })

  it('returns an empty cart for malformed json', () => {
    expect(deserialiseCart('{not json')).toEqual([])
  })

  it('returns an empty cart when the payload is not an array', () => {
    expect(deserialiseCart('{"slug":"x"}')).toEqual([])
  })

  it('drops entries with the wrong shape', () => {
    expect(
      deserialiseCart('[{"slug":"a"},{"slug":"b","variantId":"m","quantity":2}]'),
    ).toEqual([{ slug: 'b', variantId: 'm', quantity: 2 }])
  })
})
