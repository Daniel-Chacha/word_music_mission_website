import type { CartLine } from '@/content/types'

export const CART_STORAGE_KEY = 'wmt.cart.v1'

export type CartAction =
  | { type: 'add'; line: CartLine }
  | { type: 'remove'; slug: string; variantId: string }
  | { type: 'setQuantity'; slug: string; variantId: string; quantity: number }
  | { type: 'restore'; lines: CartLine[] }
  | { type: 'clear' }

function sameLine(line: CartLine, slug: string, variantId: string): boolean {
  return line.slug === slug && line.variantId === variantId
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
    case 'restore':
      return action.lines.map((l) => ({ ...l }))
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
