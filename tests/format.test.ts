import { describe, it, expect } from 'vitest'
import { formatKes, formatDate } from '@/lib/format'

describe('formatKes', () => {
  it('formats whole shillings from integer cents', () => {
    expect(formatKes(150000)).toBe('KES 1,500')
  })

  it('shows cents only when they are non-zero', () => {
    expect(formatKes(150050)).toBe('KES 1,500.50')
  })

  it('handles zero', () => {
    expect(formatKes(0)).toBe('KES 0')
  })

  it('handles values under one shilling', () => {
    expect(formatKes(50)).toBe('KES 0.50')
  })
})

describe('formatDate', () => {
  it('renders a readable Kenyan-style date', () => {
    expect(formatDate('2026-03-14')).toBe('14 March 2026')
  })
})
