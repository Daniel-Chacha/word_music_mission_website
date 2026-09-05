# Word Mission Team — Commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a merchandise and book shop with a real Paystack checkout (M-Pesa + card), Firestore order records, and an admin order list — while keeping the site fully functional when no payment credentials are configured.

**Architecture:** The cart is client-side (React context + `localStorage`) and carries only product identifiers. `POST /api/checkout` re-prices every line from `content/merch.ts`, writes a `pending` order to Firestore, and initialises a Paystack transaction. A signature-verified, idempotent webhook is the sole authority on payment success. Every server integration is behind a capability check so a missing env var downgrades the shop to WhatsApp ordering instead of erroring.

**Tech Stack:** Next.js 16.3.4 route handlers, `firebase-admin`, Paystack REST API, Node `crypto`, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-05-word-mission-website-design.md` (§8 Commerce data flow)

**Depends on:** `docs/superpowers/plans/2026-09-05-word-mission-content-site.md` Tasks 1–8 (content types, `formatKes`, `bySlug`, UI primitives, `ScrimmedImage`).

## Global Constraints

All constraints from the content-site plan apply. Additionally:

- **Never trust client prices.** The client sends only `{slug, variantId, quantity}`. Prices, line totals and the order total are computed server-side from `content/merch.ts`. A request carrying its own prices must not influence the amount charged.
- **Verify the raw body.** The webhook computes HMAC-SHA512 over the *unparsed* request body. Parsing and re-serialising changes the bytes and breaks the signature.
- **The webhook is the source of truth**, not the browser redirect. A customer who closes the tab after paying must still end up with a paid order.
- **The webhook is idempotent.** Paystack retries; a repeated `charge.success` for an already-paid order is a no-op.
- **Server-only secrets.** `PAYSTACK_SECRET_KEY`, `FIREBASE_PRIVATE_KEY`, `ADMIN_PASSWORD` and `ADMIN_COOKIE_SECRET` must never appear in a `NEXT_PUBLIC_` variable or reach a Client Component.
- **Graceful degradation is a hard requirement.** With Paystack or Firebase env vars absent, product pages render and the buy action becomes "Order on WhatsApp". No crash, no dead button, no import-time throw.
- **Money is integer KES cents.** Paystack's `amount` field is the currency subunit, which matches `priceCents` exactly — pass it through with no conversion.
- **Proxy, not middleware.** Next 16 renamed `middleware.ts` to `proxy.ts` at the project root.

---

## File Structure

```
content/merch.ts          Products and variants. Data only.
lib/
  pricing.ts              Server-side re-pricing. Pure, fully tested.
  cart.ts                 Cart reducer + storage codec. Pure, fully tested.
  paystack.ts             Paystack client + signature verification.
  firebase.ts             Firebase Admin singleton + capability check.
  orders.ts               Firestore order repository.
  admin-auth.ts           Cookie signing/verification for /admin.
components/commerce/
  CartProvider.tsx        Client context wrapping the reducer.
  AddToCart.tsx           Variant picker + add button, or WhatsApp fallback.
  CartSummary.tsx         Line items and totals.
  ProductCard.tsx         Catalog tile.
app/
  merch/                  page, [slug], cart, checkout, order/[reference]
  admin/                  login, orders
  api/checkout/route.ts
  api/webhooks/paystack/route.ts
  api/admin/login/route.ts
proxy.ts                  Gates /admin/*
tests/                    pricing.test.ts cart.test.ts paystack.test.ts
```

**Boundary rationale:** `lib/pricing.ts` and `lib/cart.ts` are pure and hold the logic worth testing. Every module that touches an external service (`firebase.ts`, `paystack.ts`) exports a capability predicate so callers degrade rather than throw. Route handlers stay thin — they orchestrate, they do not compute.

---

## Task 1: Product catalog and server-side pricing

**Files:**
- Create: `content/merch.ts`, `lib/pricing.ts`
- Modify: `content/types.ts`
- Test: `tests/pricing.test.ts`

**Interfaces:**
- Produces:
  - `ProductVariant`, `Product`, `CartLine`, `PricedLine`, `PricedOrder` types
  - `products: Product[]`
  - `priceOrder(lines: CartLine[]): PricedOrder`
  - `SHIPPING_CENTS: number`

- [ ] **Step 1: Add commerce types to `content/types.ts`**

```ts
export interface ProductVariant {
  id: string
  label: string
  priceCents: number
  inStock: boolean
}

export type ProductCategory = 'apparel' | 'accessory' | 'book'

export interface Product {
  slug: string
  name: string
  category: ProductCategory
  description: string
  details: string[]
  images: Photo[]
  variants: ProductVariant[]
  featured?: boolean
}

/** What the browser sends. Deliberately carries no price. */
export interface CartLine {
  slug: string
  variantId: string
  quantity: number
}

export interface PricedLine {
  slug: string
  variantId: string
  quantity: number
  name: string
  variantLabel: string
  unitPriceCents: number
  lineTotalCents: number
}

export interface PricedOrder {
  lines: PricedLine[]
  subtotalCents: number
  shippingCents: number
  totalCents: number
  rejected: CartLine[]
}
```

- [ ] **Step 2: Create `content/merch.ts`**

Covers every item in the brief: T-shirts, hoodies, caps, wristbands, and books.

```ts
import type { Product } from './types'

const PLACEHOLDER_IMAGE = {
  src: '/images/placeholder.svg',
  alt: 'TODO: Replace with a product photograph',
  width: 1600,
  height: 1067,
}

// TODO: Confirm every price with the ministry before launch.
// Prices are integer KES cents: 150000 = KES 1,500.
export const products: Product[] = [
  {
    slug: 'word-mission-tee',
    name: 'Word Mission Team T-Shirt',
    category: 'apparel',
    description:
      'Heavy cotton tee carrying the Word Mission mark. Worn on every school mission.',
    details: ['100% cotton', 'Unisex fit', 'Printed in Nairobi'],
    images: [PLACEHOLDER_IMAGE],
    featured: true,
    variants: [
      { id: 's', label: 'Small', priceCents: 150000, inStock: true },
      { id: 'm', label: 'Medium', priceCents: 150000, inStock: true },
      { id: 'l', label: 'Large', priceCents: 150000, inStock: true },
      { id: 'xl', label: 'Extra Large', priceCents: 160000, inStock: true },
    ],
  },
  {
    slug: 'word-mission-hoodie',
    name: 'Word Mission Team Hoodie',
    category: 'apparel',
    description: 'Brushed fleece hoodie in black with gold embroidery.',
    details: ['Cotton-polyester fleece', 'Unisex fit', 'Embroidered mark'],
    images: [PLACEHOLDER_IMAGE],
    featured: true,
    variants: [
      { id: 's', label: 'Small', priceCents: 350000, inStock: true },
      { id: 'm', label: 'Medium', priceCents: 350000, inStock: true },
      { id: 'l', label: 'Large', priceCents: 350000, inStock: true },
      { id: 'xl', label: 'Extra Large', priceCents: 370000, inStock: true },
    ],
  },
  {
    slug: 'word-mission-cap',
    name: 'Word Mission Cap',
    category: 'accessory',
    description: 'Adjustable black cap with the gold Word Mission mark.',
    details: ['One size, adjustable strap', 'Embroidered front'],
    images: [PLACEHOLDER_IMAGE],
    variants: [{ id: 'one', label: 'One size', priceCents: 100000, inStock: true }],
  },
  {
    slug: 'word-mission-wristband',
    name: 'Word Mission Wristband',
    category: 'accessory',
    description:
      'Silicone wristband carrying a memory verse — made to be given away.',
    details: ['Silicone', 'Sold singly'],
    images: [PLACEHOLDER_IMAGE],
    variants: [{ id: 'one', label: 'One size', priceCents: 20000, inStock: true }],
  },
  {
    slug: 'identity-in-christ-book',
    name: 'Identity in Christ',
    category: 'book',
    description:
      'TODO: Replace with the real book description, author and page count.',
    details: ['Paperback', 'TODO: page count'],
    images: [PLACEHOLDER_IMAGE],
    featured: true,
    variants: [{ id: 'paperback', label: 'Paperback', priceCents: 80000, inStock: true }],
  },
]

export const PRODUCT_CATEGORY_LABELS: Record<Product['category'], string> = {
  apparel: 'Apparel',
  accessory: 'Accessories',
  book: 'Books',
}
```

- [ ] **Step 3: Write the failing pricing tests**

`tests/pricing.test.ts`. The tampering test is the point of this module.

```ts
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
    // A tampered payload claiming the tee costs 1 cent.
    const tampered = [
      { slug: tee.slug, variantId: 'm', quantity: 1, unitPriceCents: 1, lineTotalCents: 1 },
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
    expect(priceOrder([{ slug: tee.slug, variantId: 'm', quantity: 0 }]).lines[0].quantity).toBe(1)
    expect(priceOrder([{ slug: tee.slug, variantId: 'm', quantity: 999 }]).lines[0].quantity).toBe(20)
    expect(priceOrder([{ slug: tee.slug, variantId: 'm', quantity: -5 }]).lines[0].quantity).toBe(1)
  })

  it('floors fractional quantities', () => {
    expect(priceOrder([{ slug: tee.slug, variantId: 'm', quantity: 2.9 }]).lines[0].quantity).toBe(2)
  })

  it('charges no shipping on an empty order', () => {
    const order = priceOrder([])
    expect(order.subtotalCents).toBe(0)
    expect(order.shippingCents).toBe(0)
    expect(order.totalCents).toBe(0)
  })

  it('rejects an out-of-stock variant', () => {
    const order = priceOrder([{ slug: 'out-of-stock-probe', variantId: 'x', quantity: 1 }])
    expect(order.lines).toHaveLength(0)
  })
})
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `npm test tests/pricing.test.ts`
Expected: FAIL — cannot resolve `@/lib/pricing`.

- [ ] **Step 5: Implement `lib/pricing.ts`**

```ts
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
 * Re-prices a cart from the catalog. The caller's `lines` may contain any
 * client-supplied fields; only slug, variantId and quantity are read, so a
 * tampered price cannot influence the total.
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
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add content/types.ts content/merch.ts lib/pricing.ts tests/pricing.test.ts
git commit -m "feat: add product catalog and tamper-proof server-side pricing"
```

---

## Task 2: Cart reducer and provider

**Files:**
- Create: `lib/cart.ts`, `components/commerce/CartProvider.tsx`
- Test: `tests/cart.test.ts`

**Interfaces:**
- Produces:
  - `cartReducer(state: CartLine[], action: CartAction): CartLine[]`
  - `CartAction = {type:'add', line} | {type:'remove', slug, variantId} | {type:'setQuantity', slug, variantId, quantity} | {type:'clear'}`
  - `serialiseCart(lines): string`, `deserialiseCart(raw: string | null): CartLine[]`
  - `CART_STORAGE_KEY: string`
  - `<CartProvider>`, `useCart(): { lines, add, remove, setQuantity, clear, count }`

- [ ] **Step 1: Write the failing cart tests**

`tests/cart.test.ts`:

```ts
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
    const withL = cartReducer(withM, {
      type: 'add',
      line: { ...tee, variantId: 'l' },
    })
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
    expect(deserialiseCart('[{"slug":"a"},{"slug":"b","variantId":"m","quantity":2}]'))
      .toEqual([{ slug: 'b', variantId: 'm', quantity: 2 }])
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test tests/cart.test.ts`
Expected: FAIL — cannot resolve `@/lib/cart`.

- [ ] **Step 3: Implement `lib/cart.ts`**

```ts
import type { CartLine } from '@/content/types'

export const CART_STORAGE_KEY = 'wmt.cart.v1'

export type CartAction =
  | { type: 'add'; line: CartLine }
  | { type: 'remove'; slug: string; variantId: string }
  | { type: 'setQuantity'; slug: string; variantId: string; quantity: number }
  | { type: 'clear' }

function sameLine(a: CartLine, slug: string, variantId: string): boolean {
  return a.slug === slug && a.variantId === variantId
}

export function cartReducer(state: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'add': {
      const existing = state.find((l) =>
        sameLine(l, action.line.slug, action.line.variantId),
      )
      if (!existing) return [...state, { ...action.line }]
      return state.map((l) =>
        sameLine(l, action.line.slug, action.line.variantId)
          ? { ...l, quantity: l.quantity + action.line.quantity }
          : l,
      )
    }
    case 'remove':
      return state.filter((l) => !sameLine(l, action.slug, action.variantId))
    case 'setQuantity':
      if (action.quantity <= 0) {
        return state.filter((l) => !sameLine(l, action.slug, action.variantId))
      }
      return state.map((l) =>
        sameLine(l, action.slug, action.variantId)
          ? { ...l, quantity: action.quantity }
          : l,
      )
    case 'clear':
      return []
  }
}

export function serialiseCart(lines: CartLine[]): string {
  return JSON.stringify(lines)
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false
  const line = value as Record<string, unknown>
  return (
    typeof line.slug === 'string' &&
    typeof line.variantId === 'string' &&
    typeof line.quantity === 'number'
  )
}

/** Never throws. A corrupted or foreign payload yields an empty cart. */
export function deserialiseCart(raw: string | null): CartLine[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCartLine)
  } catch {
    return []
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Create `components/commerce/CartProvider.tsx`**

```tsx
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react'
import type { CartLine } from '@/content/types'
import {
  cartReducer,
  serialiseCart,
  deserialiseCart,
  CART_STORAGE_KEY,
} from '@/lib/cart'

interface CartContextValue {
  lines: CartLine[]
  count: number
  ready: boolean
  add: (line: CartLine) => void
  remove: (slug: string, variantId: string) => void
  setQuantity: (slug: string, variantId: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, [])
  // `ready` guards against a hydration mismatch: the server renders an empty
  // cart, so consumers must not show counts until storage has been read.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = deserialiseCart(window.localStorage.getItem(CART_STORAGE_KEY))
      for (const line of stored) dispatch({ type: 'add', line })
    } catch {
      // Private browsing or blocked storage — start with an empty cart.
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, serialiseCart(lines))
    } catch {
      // Storage unavailable; the cart still works for this page session.
    }
  }, [lines, ready])

  const value: CartContextValue = {
    lines,
    ready,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
    add: (line) => dispatch({ type: 'add', line }),
    remove: (slug, variantId) => dispatch({ type: 'remove', slug, variantId }),
    setQuantity: (slug, variantId, quantity) =>
      dispatch({ type: 'setQuantity', slug, variantId, quantity }),
    clear: () => dispatch({ type: 'clear' }),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside a CartProvider')
  return context
}
```

- [ ] **Step 6: Mount the provider in `app/layout.tsx`**

Wrap `{children}` — not the whole body — so `Header` and `Footer` stay Server Components:

```tsx
import { CartProvider } from '@/components/commerce/CartProvider'
// ...
<main id="main" className="flex-1">
  <CartProvider>{children}</CartProvider>
</main>
```

- [ ] **Step 7: Commit**

```bash
git add lib/cart.ts components/commerce/CartProvider.tsx app/layout.tsx tests/cart.test.ts
git commit -m "feat: add tested cart reducer and provider"
```

---

## Task 3: Paystack client and signature verification

**Files:**
- Create: `lib/paystack.ts`
- Test: `tests/paystack.test.ts`
- Create: `.env.example`

**Interfaces:**
- Produces:
  - `isPaystackConfigured(): boolean`
  - `verifyPaystackSignature(rawBody: string, signature: string | null, secret: string): boolean`
  - `initializeTransaction(input): Promise<{authorizationUrl: string; reference: string}>`
  - `verifyTransaction(reference): Promise<{status: string; amount: number; reference: string}>`

- [ ] **Step 1: Install the Firebase and Paystack dependencies**

Paystack has no official Node SDK worth the dependency — the two endpoints used here are plain `fetch` calls. Only `firebase-admin` is installed (used in Task 5).

```bash
npm install firebase-admin
```

- [ ] **Step 2: Write the failing signature tests**

`tests/paystack.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { createHmac } from 'node:crypto'
import { verifyPaystackSignature } from '@/lib/paystack'

const SECRET = 'sk_test_example_secret'
const BODY = JSON.stringify({ event: 'charge.success', data: { reference: 'abc' } })

function sign(body: string, secret = SECRET): string {
  return createHmac('sha512', secret).update(body).digest('hex')
}

describe('verifyPaystackSignature', () => {
  it('accepts a correctly signed body', () => {
    expect(verifyPaystackSignature(BODY, sign(BODY), SECRET)).toBe(true)
  })

  it('rejects a body signed with a different secret', () => {
    expect(verifyPaystackSignature(BODY, sign(BODY, 'wrong'), SECRET)).toBe(false)
  })

  it('rejects a tampered body', () => {
    const signature = sign(BODY)
    const tampered = JSON.stringify({ event: 'charge.success', data: { reference: 'xyz' } })
    expect(verifyPaystackSignature(tampered, signature, SECRET)).toBe(false)
  })

  it('rejects a missing signature', () => {
    expect(verifyPaystackSignature(BODY, null, SECRET)).toBe(false)
  })

  it('rejects a signature of the wrong length without throwing', () => {
    expect(verifyPaystackSignature(BODY, 'deadbeef', SECRET)).toBe(false)
  })

  it('rejects a non-hex signature without throwing', () => {
    expect(verifyPaystackSignature(BODY, 'z'.repeat(128), SECRET)).toBe(false)
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test tests/paystack.test.ts`
Expected: FAIL — cannot resolve `@/lib/paystack`.

- [ ] **Step 4: Implement `lib/paystack.ts`**

`timingSafeEqual` throws when buffer lengths differ, so length is checked first — that check is why the "wrong length" test exists.

```ts
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
 * The body must be the exact bytes received — re-serialising parsed JSON
 * produces different bytes and a failing signature.
 */
export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false

  const expected = createHmac('sha512', secret).update(rawBody).digest('hex')
  if (signature.length !== expected.length) return false

  try {
    return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))
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
```

- [ ] **Step 5: Create `.env.example`**

```bash
# Paystack — https://dashboard.paystack.com/#/settings/developers
# Without these the shop still renders and falls back to WhatsApp ordering.
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

# Firebase Admin — Project settings > Service accounts > Generate new private key
# FIREBASE_PRIVATE_KEY must keep its \n escapes and stay wrapped in quotes.
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=""

# Admin order list at /admin/orders
ADMIN_PASSWORD=
ADMIN_COOKIE_SECRET=

# Public site URL, used for Paystack callbacks and sitemap entries
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 6: Run the tests and commit**

Run: `npm test`
Expected: PASS.

```bash
git add lib/paystack.ts tests/paystack.test.ts .env.example package.json package-lock.json
git commit -m "feat: add Paystack client with verified webhook signatures"
```

---

## Task 4: Firestore orders repository

**Files:**
- Create: `lib/firebase.ts`, `lib/orders.ts`

**Interfaces:**
- Produces:
  - `isFirebaseConfigured(): boolean`, `getDb(): Firestore`
  - `Order`, `OrderStatus`, `Customer` types
  - `createPendingOrder(input): Promise<string>`
  - `markOrderPaid(reference, paystackReference): Promise<'updated' | 'already-paid' | 'not-found'>`
  - `getOrder(reference): Promise<Order | null>`
  - `listOrders(limit?): Promise<Order[]>`
  - `isCommerceEnabled(): boolean`

- [ ] **Step 1: Create `lib/firebase.ts`**

Module-scope initialisation is guarded so importing this file with no credentials does not throw — that guard is what keeps the shop rendering when Firebase is unconfigured.

```ts
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  )
}

let app: App | undefined

function getApp(): App {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase Admin credentials are not configured')
  }
  if (app) return app

  const existing = getApps()
  if (existing.length > 0) {
    app = existing[0]
    return app
  }

  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel stores the key with literal \n sequences; restore real newlines.
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  })
  return app
}

export function getDb(): Firestore {
  return getFirestore(getApp())
}
```

- [ ] **Step 2: Create `lib/orders.ts`**

```ts
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

/** Online checkout requires both integrations. Either missing → WhatsApp ordering. */
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
  const reference = `WMT-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`

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
 * Idempotent. Paystack retries webhooks, so a second call for an order that
 * is already paid reports 'already-paid' and writes nothing.
 */
export async function markOrderPaid(
  reference: string,
  paystackReference: string,
): Promise<'updated' | 'already-paid' | 'not-found'> {
  const ref = getDb().collection(COLLECTION).doc(reference)

  return getDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists) return 'not-found'
    if (snapshot.get('status') === 'paid') return 'already-paid'

    transaction.update(ref, {
      status: 'paid',
      paidAt: new Date().toISOString(),
      paystackReference,
    })
    return 'updated'
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
```

- [ ] **Step 3: Verify no import-time throw**

Run: `node -e "process.env.FIREBASE_PROJECT_ID=''; import('./lib/orders.ts').catch(e=>{console.error('FAIL',e);process.exit(1)}).then(m=>console.log('OK', m.isCommerceEnabled()))"` — or simply confirm `npm run build` succeeds with an empty `.env.local`.
Expected: build succeeds; `isCommerceEnabled()` is `false`.

- [ ] **Step 4: Commit**

```bash
git add lib/firebase.ts lib/orders.ts
git commit -m "feat: add Firestore order repository with idempotent payment marking"
```

---

## Task 5: Catalog pages

**Files:**
- Create: `components/commerce/ProductCard.tsx`, `components/commerce/AddToCart.tsx`
- Create: `app/merch/page.tsx`, `app/merch/[slug]/page.tsx`

- [ ] **Step 1: Create `components/commerce/ProductCard.tsx`**

```tsx
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/content/types'
import { formatKes } from '@/lib/format'

export function ProductCard({ product }: { product: Product }) {
  const from = Math.min(...product.variants.map((v) => v.priceCents))

  return (
    <article className="group">
      <Link href={`/merch/${product.slug}`}>
        <div className="grain relative aspect-square overflow-hidden bg-ink-800">
          <Image
            src={product.images[0].src}
            alt=""
            width={product.images[0].width}
            height={product.images[0].height}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <h3 className="mt-5 text-lg font-bold transition-colors group-hover:text-gold-300">
          {product.name}
        </h3>
        <p className="mt-2 text-gold-300">
          {product.variants.length > 1 ? `From ${formatKes(from)}` : formatKes(from)}
        </p>
      </Link>
    </article>
  )
}
```

- [ ] **Step 2: Create `components/commerce/AddToCart.tsx`**

The degradation point: when `commerceEnabled` is false the same UI orders via WhatsApp instead.

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/content/types'
import { site } from '@/content/site'
import { formatKes } from '@/lib/format'
import { whatsappLink } from '@/lib/whatsapp'
import { useCart } from './CartProvider'

export function AddToCart({
  product,
  commerceEnabled,
}: {
  product: Product
  commerceEnabled: boolean
}) {
  const inStock = product.variants.filter((v) => v.inStock)
  const [variantId, setVariantId] = useState(inStock[0]?.id ?? '')
  const { add } = useCart()
  const router = useRouter()

  const variant = product.variants.find((v) => v.id === variantId)

  if (inStock.length === 0) {
    return <p className="text-bone-dim">Out of stock. Check back soon.</p>
  }

  function onOrderViaWhatsApp() {
    const message = `Hello Word Mission Team, I would like to order:\n\n${product.name}\nOption: ${variant?.label}\nPrice: ${formatKes(variant?.priceCents ?? 0)}`
    window.open(whatsappLink(site.contact.whatsapp, message), '_blank', 'noopener')
  }

  return (
    <div>
      <p className="text-3xl font-black text-gold-500">
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
                    : 'border-gold-700/60 text-bone-dim hover:border-gold-500'
                } ${!v.inStock ? 'cursor-not-allowed opacity-40' : ''}`}
              >
                <input
                  type="radio"
                  name="variant"
                  value={v.id}
                  checked={variantId === v.id}
                  disabled={!v.inStock}
                  onChange={() => setVariantId(v.id)}
                  className="sr-only"
                />
                {v.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {commerceEnabled ? (
        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => add({ slug: product.slug, variantId, quantity: 1 })}
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
      ) : (
        <div className="mt-10">
          <button
            type="button"
            onClick={onOrderViaWhatsApp}
            className="bg-gold-500 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-ink-900 transition-colors hover:bg-gold-300"
          >
            Order on WhatsApp
          </button>
          <p className="mt-4 text-xs text-bone-dim">
            Online payment is coming soon. For now we take orders on WhatsApp
            and confirm delivery with you directly.
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create `app/merch/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { products, PRODUCT_CATEGORY_LABELS } from '@/content/merch'
import type { ProductCategory } from '@/content/types'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProductCard } from '@/components/commerce/ProductCard'

export const metadata: Metadata = {
  title: 'Merchandise & Books',
  description:
    'Word Mission Team apparel, accessories and books. Every purchase supports school missions.',
}

const ORDER: ProductCategory[] = ['apparel', 'accessory', 'book']

export default function MerchPage() {
  return (
    <>
      <Section>
        <Container>
          <p className="eyebrow">Merchandise &amp; Books</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.98] tracking-[-0.02em]">
            Wear it, read it, share it
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-bone-dim">
            Every purchase goes straight back into reaching students. Nothing
            here is sold for profit.
          </p>
        </Container>
      </Section>

      {ORDER.map((category, index) => {
        const items = products.filter((p) => p.category === category)
        if (items.length === 0) return null

        return (
          <Section key={category} className={index % 2 === 0 ? '' : 'bg-ink-800'}>
            <Container>
              <SectionHeading
                eyebrow={PRODUCT_CATEGORY_LABELS[category]}
                number={`0${index + 1}`}
                title={PRODUCT_CATEGORY_LABELS[category]}
              />
              <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            </Container>
          </Section>
        )
      })}
    </>
  )
}
```

- [ ] **Step 4: Create `app/merch/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { products } from '@/content/merch'
import { bySlug } from '@/lib/content'
import { isCommerceEnabled } from '@/lib/orders'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { AddToCart } from '@/components/commerce/AddToCart'

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata(
  props: PageProps<'/merch/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params
  const product = bySlug(products, slug)
  if (!product) return {}
  return { title: product.name, description: product.description }
}

export default async function ProductPage(props: PageProps<'/merch/[slug]'>) {
  const { slug } = await props.params
  const product = bySlug(products, slug)
  if (!product) notFound()

  return (
    <Section>
      <Container className="grid gap-14 lg:grid-cols-2">
        <div className="grain relative aspect-square overflow-hidden bg-ink-800">
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt}
            width={product.images[0].width}
            height={product.images[0].height}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            {product.name}
          </h1>
          <p className="mt-6 text-bone-dim">{product.description}</p>

          <AddToCart product={product} commerceEnabled={isCommerceEnabled()} />

          <ul className="mt-12 border-t border-gold-700/40 pt-6">
            {product.details.map((detail) => (
              <li key={detail} className="border-b border-ink-600 py-3 text-sm text-bone-dim">
                {detail}
              </li>
            ))}
          </ul>

          <Button href="/merch" variant="ghost" className="mt-10">
            All products
          </Button>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 5: Verify and commit**

With no `.env.local`, `/merch/word-mission-tee` must show "Order on WhatsApp". Add `PAYSTACK_SECRET_KEY` and the Firebase vars, restart, and it must show "Add to cart".

```bash
git add components/commerce/ app/merch/
git commit -m "feat: add product catalog with WhatsApp fallback"
```

---

## Task 6: Cart and checkout pages

**Files:**
- Create: `components/commerce/CartSummary.tsx`
- Create: `app/merch/cart/page.tsx`, `app/merch/checkout/page.tsx`, `app/merch/checkout/CheckoutForm.tsx`

- [ ] **Step 1: Create `components/commerce/CartSummary.tsx`**

Prices shown here are for display only. The authoritative total is recomputed server-side in Task 7.

```tsx
'use client'

import Link from 'next/link'
import { products } from '@/content/merch'
import { formatKes } from '@/lib/format'
import { SHIPPING_CENTS } from '@/lib/pricing'
import { useCart } from './CartProvider'

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
                <span className="sr-only">Quantity for {product.name}</span>
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
```

- [ ] **Step 2: Create `app/merch/cart/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { CartSummary } from '@/components/commerce/CartSummary'

export const metadata: Metadata = { title: 'Your Cart' }

export default function CartPage() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <p className="eyebrow">Your Cart</p>
        <h1 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
          Review your order
        </h1>
        <div className="mt-14">
          <CartSummary />
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/merch/checkout" variant="gold" size="lg">
            Checkout
          </Button>
          <Button href="/merch" variant="ghost" size="lg">
            Keep shopping
          </Button>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 3: Create `app/merch/checkout/CheckoutForm.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Field } from '@/components/ui/Field'
import { useCart } from '@/components/commerce/CartProvider'

export function CheckoutForm() {
  const { lines, ready } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (ready && lines.length === 0) {
    router.replace('/merch')
    return null
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

      window.location.href = payload.authorizationUrl
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
        <div
          role="alert"
          className="mt-8 border border-blood-bright/60 bg-ink-800 p-5"
        >
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
        You will be redirected to Paystack to complete payment securely. We
        never see or store your card details.
      </p>
    </form>
  )
}
```

- [ ] **Step 4: Create `app/merch/checkout/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isCommerceEnabled } from '@/lib/orders'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { CartSummary } from '@/components/commerce/CartSummary'
import { CheckoutForm } from './CheckoutForm'

export const metadata: Metadata = { title: 'Checkout' }

export default function CheckoutPage() {
  // Without credentials there is no checkout to show — send them back to the
  // shop, where every product offers WhatsApp ordering.
  if (!isCommerceEnabled()) redirect('/merch')

  return (
    <Section>
      <Container className="grid gap-14 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            Delivery details
          </h1>
          <div className="mt-12">
            <CheckoutForm />
          </div>
        </div>

        <div className="lg:border-l lg:border-gold-700/40 lg:pl-14">
          <p className="eyebrow">Your order</p>
          <div className="mt-8">
            <CartSummary editable={false} />
          </div>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/commerce/CartSummary.tsx app/merch/cart/ app/merch/checkout/
git commit -m "feat: add cart and checkout pages"
```

---

## Task 7: Checkout and webhook route handlers

**Files:**
- Create: `app/api/checkout/route.ts`, `app/api/webhooks/paystack/route.ts`

- [ ] **Step 1: Create `app/api/checkout/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { priceOrder } from '@/lib/pricing'
import { createPendingOrder, isCommerceEnabled, type Customer } from '@/lib/orders'
import { initializeTransaction } from '@/lib/paystack'
import type { CartLine } from '@/content/types'

function isValidCustomer(value: unknown): value is Customer {
  if (typeof value !== 'object' || value === null) return false
  const c = value as Record<string, unknown>
  return (
    typeof c.name === 'string' && c.name.trim() !== '' &&
    typeof c.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) &&
    typeof c.phone === 'string' && c.phone.trim() !== '' &&
    typeof c.location === 'string' && c.location.trim() !== ''
  )
}

export async function POST(request: Request) {
  if (!isCommerceEnabled()) {
    return NextResponse.json(
      { error: 'Online payment is not available yet. Please order on WhatsApp.' },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { items, customer } = (body ?? {}) as {
    items?: CartLine[]
    customer?: unknown
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
  }

  if (!isValidCustomer(customer)) {
    return NextResponse.json(
      { error: 'Please fill in your name, a valid email, phone and location.' },
      { status: 400 },
    )
  }

  // Authoritative pricing. Anything the client sent about money is discarded.
  const order = priceOrder(items)

  if (order.lines.length === 0) {
    return NextResponse.json(
      { error: 'None of the items in your cart are available.' },
      { status: 400 },
    )
  }

  try {
    const reference = await createPendingOrder({
      lines: order.lines,
      subtotalCents: order.subtotalCents,
      shippingCents: order.shippingCents,
      totalCents: order.totalCents,
      customer,
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin

    const { authorizationUrl } = await initializeTransaction({
      email: customer.email,
      amountCents: order.totalCents,
      reference,
      callbackUrl: `${siteUrl}/merch/order/${reference}`,
      metadata: { reference, customerName: customer.name },
    })

    return NextResponse.json({
      authorizationUrl,
      reference,
      rejected: order.rejected,
    })
  } catch (cause) {
    console.error('Checkout failed', cause)
    return NextResponse.json(
      { error: 'We could not start your payment. Please try again or order on WhatsApp.' },
      { status: 502 },
    )
  }
}
```

- [ ] **Step 2: Create `app/api/webhooks/paystack/route.ts`**

`request.text()` reads the raw bytes — this must happen before any parsing, or the HMAC will not match.

```ts
import { NextResponse } from 'next/server'
import { verifyPaystackSignature } from '@/lib/paystack'
import { markOrderPaid } from '@/lib/orders'

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  // Raw body first. Parsing and re-serialising would break the signature.
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  if (!verifyPaystackSignature(rawBody, signature, secret)) {
    console.warn('Rejected Paystack webhook with an invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { event?: string; data?: { reference?: string; status?: string } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (event.event !== 'charge.success') {
    // Acknowledge events we do not act on so Paystack stops retrying them.
    return NextResponse.json({ received: true })
  }

  const reference = event.data?.reference
  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
  }

  try {
    const result = await markOrderPaid(reference, reference)
    if (result === 'not-found') {
      console.error(`Paystack webhook for unknown order ${reference}`)
    }
    // 'already-paid' is a normal retry — acknowledge it as success.
    return NextResponse.json({ received: true, result })
  } catch (cause) {
    console.error('Failed to record payment', cause)
    // A 500 makes Paystack retry, which is what we want on a transient failure.
    return NextResponse.json({ error: 'Could not record payment' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/
git commit -m "feat: add checkout and signature-verified Paystack webhook"
```

---

## Task 8: Order receipt page

**Files:**
- Create: `app/merch/order/[reference]/page.tsx`, `app/merch/order/[reference]/ClearCart.tsx`

- [ ] **Step 1: Create `ClearCart.tsx`**

The cart lives in the browser, so it can only be emptied client-side once payment is confirmed.

```tsx
'use client'

import { useEffect } from 'react'
import { useCart } from '@/components/commerce/CartProvider'

export function ClearCart() {
  const { clear, ready } = useCart()

  useEffect(() => {
    if (ready) clear()
    // Runs once when storage is loaded; `clear` is stable enough for this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return null
}
```

- [ ] **Step 2: Create `app/merch/order/[reference]/page.tsx`**

The page verifies with Paystack directly so a customer sees a correct receipt even if the webhook has not yet landed. The webhook remains the authority for the stored record.

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { site } from '@/content/site'
import { getOrder, isCommerceEnabled, markOrderPaid } from '@/lib/orders'
import { verifyTransaction } from '@/lib/paystack'
import { formatKes } from '@/lib/format'
import { whatsappLink } from '@/lib/whatsapp'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/Button'
import { ClearCart } from './ClearCart'

export const metadata: Metadata = { title: 'Your Order' }
export const dynamic = 'force-dynamic'

export default async function OrderPage(
  props: PageProps<'/merch/order/[reference]'>,
) {
  const { reference } = await props.params
  if (!isCommerceEnabled()) notFound()

  const order = await getOrder(reference)
  if (!order) notFound()

  let status = order.status

  // The webhook is the source of truth, but it may not have arrived yet.
  // Verifying here lets the customer see a correct receipt immediately.
  if (status === 'pending') {
    try {
      const transaction = await verifyTransaction(reference)
      if (transaction.status === 'success') {
        await markOrderPaid(reference, transaction.reference)
        status = 'paid'
      }
    } catch (cause) {
      console.error('Could not verify transaction', cause)
    }
  }

  const paid = status === 'paid'

  return (
    <Section>
      <Container className="max-w-2xl">
        {paid && <ClearCart />}

        <p className="eyebrow">{paid ? 'Payment received' : 'Payment pending'}</p>
        <h1 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
          {paid ? 'Thank you — God bless you' : 'We have not received payment yet'}
        </h1>

        <p className="mt-6 text-bone-dim">
          {paid
            ? 'Your order is confirmed. We will contact you on WhatsApp to arrange delivery.'
            : 'If you completed payment, it may take a moment to confirm. Refresh this page, or message us and we will check.'}
        </p>

        <div className="mt-12 border border-gold-700/40 p-8">
          <div className="flex justify-between border-b border-ink-600 pb-4">
            <span className="eyebrow">Order reference</span>
            <span className="font-mono text-gold-300">{order.reference}</span>
          </div>

          {order.lines.map((line) => (
            <div
              key={`${line.slug}-${line.variantId}`}
              className="flex justify-between border-b border-ink-600 py-4"
            >
              <span className="text-sm">
                {line.name} · {line.variantLabel} × {line.quantity}
              </span>
              <span className="font-mono text-sm text-bone-dim">
                {formatKes(line.lineTotalCents)}
              </span>
            </div>
          ))}

          <div className="flex justify-between py-4">
            <span className="text-sm text-bone-dim">Delivery</span>
            <span className="font-mono text-sm text-bone-dim">
              {formatKes(order.shippingCents)}
            </span>
          </div>

          <div className="flex justify-between border-t border-gold-700/40 pt-4">
            <span className="eyebrow">Total</span>
            <span className="font-mono text-2xl font-bold text-gold-500">
              {formatKes(order.totalCents)}
            </span>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Button
            href={whatsappLink(
              site.contact.whatsapp,
              `Hello Word Mission Team, I am asking about order ${order.reference}.`,
            )}
            variant="gold"
          >
            Message us about this order
          </Button>
          <Button href="/merch" variant="ghost">
            Keep shopping
          </Button>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/merch/order/
git commit -m "feat: add order receipt page with payment verification"
```

---

## Task 9: Admin authentication and order list

**Files:**
- Create: `lib/admin-auth.ts`, `proxy.ts`
- Create: `app/api/admin/login/route.ts`, `app/admin/login/page.tsx`, `app/admin/orders/page.tsx`

**Interfaces:**
- Produces: `ADMIN_COOKIE: string`, `signAdminToken(): string`, `isValidAdminToken(token?: string): boolean`

- [ ] **Step 1: Create `lib/admin-auth.ts`**

A signed, expiring token rather than a bare password cookie. `timingSafeEqual` is used for both the password check and the signature check.

```ts
import { createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_COOKIE = 'wmt_admin'
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12 // 12 hours

function secret(): string {
  const value = process.env.ADMIN_COOKIE_SECRET
  if (!value) throw new Error('ADMIN_COOKIE_SECRET is not configured')
  return value
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_COOKIE_SECRET)
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  return safeEqual(candidate, expected)
}

/** Returns `<expiry>.<hmac>`. */
export function signAdminToken(): string {
  const expiry = String(Date.now() + TOKEN_TTL_MS)
  const signature = createHmac('sha256', secret()).update(expiry).digest('hex')
  return `${expiry}.${signature}`
}

export function isValidAdminToken(token?: string): boolean {
  if (!token) return false

  const [expiry, signature] = token.split('.')
  if (!expiry || !signature) return false

  const expiresAt = Number(expiry)
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false

  const expected = createHmac('sha256', secret()).update(expiry).digest('hex')
  return safeEqual(signature, expected)
}
```

- [ ] **Step 2: Create `proxy.ts` at the project root**

Next 16 convention — `proxy.ts`, not `middleware.ts`.

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, isValidAdminToken } from '@/lib/admin-auth'

export function proxy(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value

  if (!isValidAdminToken(token)) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Everything under /admin except the login page itself.
  matcher: ['/admin', '/admin/orders/:path*'],
}
```

- [ ] **Step 3: Create `app/api/admin/login/route.ts`**

```ts
import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  checkPassword,
  isAdminConfigured,
  signAdminToken,
} from '@/lib/admin-auth'

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Admin is not configured.' }, { status: 503 })
  }

  const form = await request.formData()
  const password = String(form.get('password') ?? '')

  if (!checkPassword(password)) {
    return NextResponse.redirect(new URL('/admin/login?error=1', request.url), 303)
  }

  const response = NextResponse.redirect(new URL('/admin/orders', request.url), 303)
  response.cookies.set(ADMIN_COOKIE, signAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return response
}
```

- [ ] **Step 4: Create `app/admin/login/page.tsx`**

```tsx
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Field } from '@/components/ui/Field'

export const metadata = { robots: { index: false, follow: false } }

export default async function AdminLoginPage(
  props: PageProps<'/admin/login'>,
) {
  const { error } = await props.searchParams

  return (
    <Section>
      <Container className="max-w-md">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-6 text-3xl font-extrabold">Sign in</h1>

        {error && (
          <p role="alert" className="mt-6 text-sm text-blood-bright">
            That password was not correct.
          </p>
        )}

        <form method="POST" action="/api/admin/login" className="mt-10">
          <Field label="Password" name="password" type="password" required />
          <button
            type="submit"
            className="mt-8 w-full bg-gold-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink-900"
          >
            Sign in
          </button>
        </form>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 5: Create `app/admin/orders/page.tsx`**

```tsx
import { listOrders, isCommerceEnabled } from '@/lib/orders'
import { formatKes } from '@/lib/format'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'

export const metadata = { robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  if (!isCommerceEnabled()) {
    return (
      <Section>
        <Container>
          <h1 className="text-3xl font-extrabold">Orders</h1>
          <p className="mt-6 text-bone-dim">
            Commerce is not configured. Add the Paystack and Firebase
            environment variables to enable online orders.
          </p>
        </Container>
      </Section>
    )
  }

  const orders = await listOrders()

  return (
    <Section>
      <Container>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-6 text-3xl font-extrabold">
          Orders <span className="text-bone-dim">({orders.length})</span>
        </h1>

        {orders.length === 0 ? (
          <p className="mt-10 text-bone-dim">No orders yet.</p>
        ) : (
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-gold-700/40">
                  <th scope="col" className="eyebrow py-3">Reference</th>
                  <th scope="col" className="eyebrow py-3">Status</th>
                  <th scope="col" className="eyebrow py-3">Customer</th>
                  <th scope="col" className="eyebrow py-3">Items</th>
                  <th scope="col" className="eyebrow py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.reference} className="border-b border-ink-600">
                    <td className="py-4 font-mono text-gold-300">{order.reference}</td>
                    <td className="py-4">
                      <span
                        className={
                          order.status === 'paid' ? 'text-gold-300' : 'text-bone-dim'
                        }
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {order.customer.name}
                      <br />
                      <span className="text-bone-dim">{order.customer.phone}</span>
                      <br />
                      <span className="text-bone-dim">{order.customer.location}</span>
                    </td>
                    <td className="py-4 text-bone-dim">
                      {order.lines.map((line) => (
                        <div key={`${line.slug}-${line.variantId}`}>
                          {line.name} · {line.variantLabel} × {line.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="py-4 text-right font-mono">
                      {formatKes(order.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </Section>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/admin-auth.ts proxy.ts app/admin/ app/api/admin/
git commit -m "feat: add admin authentication and order list"
```

---

## Task 10: Cart indicator, sitemap and integration verification

**Files:**
- Create: `components/commerce/CartLink.tsx`
- Modify: `components/layout/Header.tsx`, `app/sitemap.ts`, `README.md`

- [ ] **Step 1: Create `components/commerce/CartLink.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'

export function CartLink() {
  const { count, ready } = useCart()

  return (
    <Link
      href="/merch/cart"
      className="relative p-2 text-bone hover:text-gold-300"
      aria-label={
        ready && count > 0 ? `Cart, ${count} items` : 'Cart'
      }
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 3h2l2.4 12h9.2L19 6H6"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="9" cy="20" r="1.4" fill="currentColor" />
        <circle cx="17" cy="20" r="1.4" fill="currentColor" />
      </svg>
      {ready && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[0.65rem] font-bold text-ink-900">
          {count}
        </span>
      )}
    </Link>
  )
}
```

- [ ] **Step 2: Add the cart link to the header**

`CartLink` calls `useCart`, so it must sit inside the `CartProvider`. The provider currently wraps only `{children}` (commerce plan Task 2 Step 6). Move it in `app/layout.tsx` to wrap `Header`, `main` and `Footer` together:

```tsx
<body className="flex min-h-full flex-col bg-ink-900 text-bone">
  <SkipLink />
  <CartProvider>
    <Header />
    <main id="main" className="flex-1">
      {children}
    </main>
    <Footer />
  </CartProvider>
</body>
```

`Header` and `Footer` remain Server Components — a Client Component may render Server Components passed as children.

Then in `components/layout/Header.tsx`, add to the right-hand action group, before the `MobileMenu`:

```tsx
import { CartLink } from '@/components/commerce/CartLink'
// ...
<div className="flex items-center gap-2">
  <CartLink />
  <Button href="/support" variant="give" className="hidden sm:inline-flex">
    Support Us
  </Button>
  <MobileMenu />
</div>
```

- [ ] **Step 3: Add merch routes to `app/sitemap.ts`**

Add the import and entries; `/merch/cart`, `/merch/checkout`, `/merch/order/*` and `/admin/*` stay out of the sitemap.

```ts
import { products } from '@/content/merch'
// staticPaths: add '/merch'
// dynamicPaths: add ...products.map((p) => `/merch/${p.slug}`)
```

- [ ] **Step 4: Verify the degraded path**

With `.env.local` absent or empty:

```bash
npm run build && npm start
```

Expected: `/merch` and every product page render; the buy button reads "Order on WhatsApp"; `/merch/checkout` redirects to `/merch`; `/admin/orders` redirects to `/admin/login`. No 500s.

- [ ] **Step 5: Verify the enabled path**

With Paystack test keys and Firebase credentials in `.env.local`:

1. Add a product to the cart, check out with the Paystack **test** card `4084 0840 8408 4081` (any future expiry, any CVV).
2. Confirm the redirect to `/merch/order/<reference>` shows "Payment received".
3. Confirm a document appears in Firestore under `orders/` with `status: "paid"`.
4. Confirm `/admin/orders` lists it after signing in.

Test the webhook signature rejection directly:

```bash
curl -i -X POST http://localhost:3000/api/webhooks/paystack \
  -H 'Content-Type: application/json' \
  -H 'x-paystack-signature: deadbeef' \
  -d '{"event":"charge.success","data":{"reference":"WMT-FAKE"}}'
```

Expected: `HTTP/1.1 401` and no change in Firestore.

- [ ] **Step 6: Document setup in `README.md`**

Add a "Commerce setup" section covering: creating a Paystack account and copying the secret key; creating a Firebase project and generating a service-account key; the `FIREBASE_PRIVATE_KEY` newline-escaping requirement; registering `https://<domain>/api/webhooks/paystack` in the Paystack dashboard; and setting `ADMIN_PASSWORD`/`ADMIN_COOKIE_SECRET` (generate the latter with `openssl rand -hex 32`).

- [ ] **Step 7: Full verification and commit**

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

```bash
git add components/commerce/CartLink.tsx components/layout/Header.tsx app/layout.tsx app/sitemap.ts README.md
git commit -m "feat: add cart indicator and document commerce setup"
```

---

## Self-Review

**Spec coverage.** §8's data flow maps to Tasks 1, 4, 6, 7, 8; its four security requirements map to Task 1 (server re-pricing, with a dedicated tampering test), Task 3 (raw-body HMAC, with tests), Task 7 (webhook as authority), and Task 4 (transactional idempotency). §8's admin auth maps to Task 9; env vars to Task 3 Step 5. §9's commerce error rows map to Tasks 5, 6, 7. §10's commerce tests map to Tasks 1, 2, 3.

**Type consistency.** `CartLine`, `PricedLine`, `PricedOrder`, `Product`, `ProductVariant` are defined once in Task 1 Step 1. `priceOrder` returns `PricedOrder`, consumed unchanged in Task 7. `createPendingOrder` accepts exactly the fields Task 7 passes. `markOrderPaid` returns the three-value union that Tasks 7 and 8 both branch on. `useCart()`'s shape is fixed in Task 2 Step 5 and matches every consumer in Tasks 5, 6, 8, 10.

**Resolved during review:** Task 2 Step 6 mounts `CartProvider` around `{children}` only, which would put `CartLink` (Task 10) outside the provider. Task 10 Step 2 now explicitly relocates the provider to wrap the header and footer, and notes why that keeps them Server Components.
