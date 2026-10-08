import { describe, it, expect } from 'vitest'
import { formatKes, formatDate, formatDateTimeLocal } from '@/lib/format'

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

describe('formatDateTimeLocal', () => {
  it('formats a datetime-local value as written, with no timezone shift', () => {
    expect(formatDateTimeLocal('2026-10-20T10:30')).toBe('Tuesday 20 October 2026, 10:30')
    expect(formatDateTimeLocal('2026-01-05T08:05')).toBe('Monday 5 January 2026, 08:05')
  })

  it('passes anything else through unchanged', () => {
    expect(formatDateTimeLocal('')).toBe('')
    expect(formatDateTimeLocal('next week')).toBe('next week')
  })
})
