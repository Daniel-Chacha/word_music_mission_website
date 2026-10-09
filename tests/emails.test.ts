import { describe, it, expect } from 'vitest'
import {
  buildEnquiry,
  contactEmail,
  customerOrderEmail,
  escapeHtml,
  isValidEmail,
  isValidName,
  orderReference,
  teamOrderEmail,
  type Customer,
} from '@/lib/emails'
import type { PricedOrder } from '@/content/types'

const order: PricedOrder = {
  lines: [
    {
      slug: 'tee',
      variantId: 'm',
      quantity: 2,
      name: 'Word Mission Tee',
      variantLabel: 'M',
      unitPriceCents: 150000,
      lineTotalCents: 300000,
    },
  ],
  subtotalCents: 300000,
  shippingCents: 30000,
  totalCents: 330000,
  rejected: [],
}

const customer: Customer = {
  name: 'Amina',
  email: 'amina@example.com',
  phone: '0712345678',
  location: 'Nakuru',
  notes: '',
}

describe('buildEnquiry', () => {
  it('renders labelled lines and skips empty values', () => {
    expect(buildEnquiry({ Name: 'Amina', School: '', Request: 'Pray for me' })).toBe(
      'Name: Amina\nRequest: Pray for me',
    )
  })
})

describe('isValidEmail', () => {
  it('accepts a normal address and rejects junk', () => {
    expect(isValidEmail('a@b.co')).toBe(true)
    expect(isValidEmail('not an email')).toBe(false)
    expect(isValidEmail('a@b')).toBe(false)
  })
})

describe('isValidName', () => {
  it('accepts real names, including accented and hyphenated ones', () => {
    expect(isValidName('Amina Wanjiru')).toBe(true)
    expect(isValidName("Chép O'Neil-Ndūng'u")).toBe(true)
    expect(isValidName('J. R. Mwangi')).toBe(true)
  })

  it('rejects bare domains that mail clients would turn into links', () => {
    expect(isValidName('Visit www.evil.com')).toBe(false)
    expect(isValidName('evil.co.ke')).toBe(false)
  })

  it('rejects links, digits and anything message-like', () => {
    expect(isValidName('Visit http://evil.example')).toBe(false)
    expect(isValidName('Call 0712345678')).toBe(false)
    expect(isValidName('Hi! Click here: x')).toBe(false)
    expect(isValidName('')).toBe(false)
  })
})

describe('escapeHtml', () => {
  it('neutralises markup', () => {
    expect(escapeHtml('<script>"x" & \'y\'</script>')).toBe(
      '&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;',
    )
  })
})

describe('orderReference', () => {
  it('is uppercase, prefixed and deterministic for fixed inputs', () => {
    expect(orderReference(0, 0)).toBe('WMT-0-0000')
    expect(orderReference(1_760_000_000_000, 0.5)).toMatch(/^WMT-[0-9A-Z]+-[0-9A-Z]{4}$/)
  })
})

describe('teamOrderEmail', () => {
  it('carries the customer, lines and total, and skips blank notes', () => {
    const email = teamOrderEmail('WMT-1', order, customer)
    expect(email.subject).toBe('New order WMT-1 — Amina')
    expect(email.text).toContain('Phone: 0712345678')
    expect(email.text).toContain('Word Mission Tee · M × 2 — KES 3,000')
    expect(email.text).toContain('Total: KES 3,300')
    expect(email.text).not.toContain('Notes:')
  })

  it('escapes customer input in the HTML part', () => {
    const email = teamOrderEmail('WMT-1', order, { ...customer, name: '<b>Eve</b>' })
    expect(email.html).toContain('&lt;b&gt;Eve&lt;/b&gt;')
    expect(email.html).not.toContain('<b>Eve</b>')
  })
})

describe('customerOrderEmail', () => {
  it('tells the customer the team will be in touch about delivery and payment', () => {
    const email = customerOrderEmail('WMT-1', order, customer, 'Word Mission Team')
    expect(email.subject).toBe('Your order WMT-1 — Word Mission Team')
    expect(email.text).toContain('Hello Amina,')
    expect(email.text).toContain('arrange delivery and share payment details')
    expect(email.text).toContain('Order reference: WMT-1')
  })

  it('never echoes free-text customer fields to the unverified inbox', () => {
    const email = customerOrderEmail(
      'WMT-1',
      order,
      { ...customer, location: 'LOCATION-TEXT', phone: 'PHONE-TEXT', notes: 'NOTES-TEXT' },
      'Word Mission Team',
    )
    for (const leaked of ['LOCATION-TEXT', 'PHONE-TEXT', 'NOTES-TEXT']) {
      expect(email.text).not.toContain(leaked)
      expect(email.html).not.toContain(leaked)
    }
  })
})

describe('contactEmail', () => {
  it('uses the preamble as the subject and body heading', () => {
    const email = contactEmail('PRAYER REQUEST', { Name: 'Amina', Request: 'Exams' })
    expect(email.subject).toBe('Website: prayer request')
    expect(email.text).toBe('PRAYER REQUEST\n\nName: Amina\nRequest: Exams')
  })
})
