'use client'

import { useEffect } from 'react'
import { dispatchCart } from '@/lib/cart-store'

/**
 * The cart lives in the browser, so it can only be emptied client-side once
 * payment is confirmed. dispatchCart is a plain store call, not React state,
 * so this effect synchronises an external system exactly as intended.
 */
export function ClearCart() {
  useEffect(() => {
    dispatchCart({ type: 'clear' })
  }, [])

  return null
}
