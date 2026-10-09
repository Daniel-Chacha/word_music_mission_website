import { describe, it, expect } from 'vitest'
import { normalisePhone, whatsappLink } from '@/lib/whatsapp'

describe('normalisePhone', () => {
  it('converts a local 07 number to international', () => {
    expect(normalisePhone('0712345678')).toBe('254712345678')
  })

  it('converts a local 01 number to international', () => {
    expect(normalisePhone('0112345678')).toBe('254112345678')
  })

  it('strips a leading plus', () => {
    expect(normalisePhone('+254712345678')).toBe('254712345678')
  })

  it('strips spaces, dashes and parentheses', () => {
    expect(normalisePhone('+254 (712) 345-678')).toBe('254712345678')
  })

  it('leaves an already-international number unchanged', () => {
    expect(normalisePhone('254712345678')).toBe('254712345678')
  })
})

describe('whatsappLink', () => {
  it('builds a wa.me url with an encoded message', () => {
    expect(whatsappLink('+254712345678', 'Hello & peace')).toBe(
      'https://wa.me/254712345678?text=Hello%20%26%20peace',
    )
  })

  it('encodes newlines', () => {
    expect(whatsappLink('0712345678', 'a\nb')).toBe(
      'https://wa.me/254712345678?text=a%0Ab',
    )
  })
})
