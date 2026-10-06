/** Steps an index around a ring of `count` items, wrapping at both ends. */
export function wrapIndex(index: number, count: number): number {
  return ((index % count) + count) % count
}

/** The slides queued after `current`, in the order they will be shown. */
export function upcoming(current: number, count: number): number[] {
  return Array.from({ length: count - 1 }, (_, i) => wrapIndex(current + 1 + i, count))
}
