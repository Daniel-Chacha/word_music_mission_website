import { describe, it, expect } from 'vitest'
import { wrapIndex, upcoming } from '@/lib/carousel'

describe('wrapIndex', () => {
  it('wraps past the end back to the start', () => {
    expect(wrapIndex(4, 4)).toBe(0)
  })

  it('wraps before the start round to the end', () => {
    expect(wrapIndex(-1, 4)).toBe(3)
  })
})

describe('upcoming', () => {
  it('lists every other slide, starting after the current one', () => {
    expect(upcoming(0, 4)).toEqual([1, 2, 3])
    expect(upcoming(2, 4)).toEqual([3, 0, 1])
  })

  it('is empty for a single slide', () => {
    expect(upcoming(0, 1)).toEqual([])
  })
})
