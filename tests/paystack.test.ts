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
    const tampered = JSON.stringify({
      event: 'charge.success',
      data: { reference: 'xyz' },
    })
    expect(verifyPaystackSignature(tampered, signature, SECRET)).toBe(false)
  })

  it('rejects a re-serialised body whose bytes differ', () => {
    // Parsing and re-stringifying changes whitespace/key order and must fail.
    const signature = sign(BODY)
    const reserialised = JSON.stringify(JSON.parse(BODY), null, 2)
    expect(verifyPaystackSignature(reserialised, signature, SECRET)).toBe(false)
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
