'use client'

import { useCallback, useSyncExternalStore } from 'react'
import {
  CART_STORAGE_KEY,
  cartReducer,
  deserialiseCart,
  serialiseCart,
  type CartAction,
} from './cart'
import type { CartLine } from '@/content/types'

/**
 * The cart is browser state, so it is modelled as an external store read
 * through useSyncExternalStore rather than as context hydrated by an effect.
 *
 * That keeps the server snapshot (an empty cart) authoritative for SSR, avoids
 * setting state inside an effect, and makes cross-tab synchronisation fall out
 * of the `storage` event for free.
 */

const EMPTY: CartLine[] = []

let state: CartLine[] = EMPTY
let hydrated = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function readStorage(): CartLine[] {
  try {
    return deserialiseCart(window.localStorage.getItem(CART_STORAGE_KEY))
  } catch {
    // Private browsing or blocked storage — start empty.
    return EMPTY
  }
}

function writeStorage(lines: CartLine[]) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, serialiseCart(lines))
  } catch {
    // Storage unavailable; the cart still works for this page session.
  }
}

function subscribe(listener: () => void): () => void {
  if (!hydrated) {
    hydrated = true
    state = readStorage()
  }

  listeners.add(listener)

  function onStorage(event: StorageEvent) {
    if (event.key !== CART_STORAGE_KEY) return
    state = readStorage()
    emit()
  }

  window.addEventListener('storage', onStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

// Must return a stable reference or useSyncExternalStore re-renders forever.
const getSnapshot = () => state
const getServerSnapshot = () => EMPTY
const getHydrated = () => hydrated
const getServerHydrated = () => false

export function dispatchCart(action: CartAction) {
  const next = cartReducer(state, action)
  if (next === state) return
  state = next
  writeStorage(next)
  emit()
}

export interface CartApi {
  lines: CartLine[]
  count: number
  /** False until localStorage has been read, so consumers can avoid flashing an empty cart. */
  ready: boolean
  add: (line: CartLine) => void
  remove: (slug: string, variantId: string) => void
  setQuantity: (slug: string, variantId: string, quantity: number) => void
  clear: () => void
}

export function useCart(): CartApi {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const ready = useSyncExternalStore(subscribe, getHydrated, getServerHydrated)

  const add = useCallback((line: CartLine) => dispatchCart({ type: 'add', line }), [])
  const remove = useCallback(
    (slug: string, variantId: string) => dispatchCart({ type: 'remove', slug, variantId }),
    [],
  )
  const setQuantity = useCallback(
    (slug: string, variantId: string, quantity: number) =>
      dispatchCart({ type: 'setQuantity', slug, variantId, quantity }),
    [],
  )
  const clear = useCallback(() => dispatchCart({ type: 'clear' }), [])

  return {
    lines,
    ready,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
    add,
    remove,
    setQuantity,
    clear,
  }
}
