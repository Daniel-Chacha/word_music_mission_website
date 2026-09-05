'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-store'

export function CartLink() {
  const { count, ready } = useCart()
  const showCount = ready && count > 0

  return (
    <Link
      href="/merch/cart"
      className="relative p-2 text-bone hover:text-gold-300"
      aria-label={showCount ? `Cart, ${count} items` : 'Cart'}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 3h2l2.4 12h9.2L19 6H6" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="9" cy="20" r="1.4" fill="currentColor" />
        <circle cx="17" cy="20" r="1.4" fill="currentColor" />
      </svg>
      {showCount && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[0.65rem] font-bold text-ink-900">
          {count}
        </span>
      )}
    </Link>
  )
}
