import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createHmac } from 'node:crypto'
import {
  isValidAdminToken,
  signAdminToken,
  checkPassword,
  isAdminConfigured,
} from '@/lib/admin-auth'

const SECRET = 'test-cookie-secret'

beforeEach(() => {
  process.env.ADMIN_COOKIE_SECRET = SECRET
  process.env.ADMIN_PASSWORD = 'correct horse battery staple'
})

afterEach(() => {
  delete process.env.ADMIN_COOKIE_SECRET
  delete process.env.ADMIN_PASSWORD
})

function sign(expiry: string, secret = SECRET): string {
  return `${expiry}.${createHmac('sha256', secret).update(expiry).digest('hex')}`
}

describe('isValidAdminToken', () => {
  it('accepts a freshly signed token', () => {
    expect(isValidAdminToken(signAdminToken())).toBe(true)
  })

  it('rejects an expired token', () => {
    expect(isValidAdminToken(sign(String(Date.now() - 1000)))).toBe(false)
  })

  it('rejects a token signed with a different secret', () => {
    const forged = sign(String(Date.now() + 60_000), 'attacker-secret')
    expect(isValidAdminToken(forged)).toBe(false)
  })

  it('rejects an extended expiry that reuses an old signature', () => {
    // Attacker pushes the expiry out but cannot re-sign it.
    const valid = signAdminToken()
    const [, signature] = valid.split('.')
    const extended = `${Date.now() + 999_999_999}.${signature}`
    expect(isValidAdminToken(extended)).toBe(false)
  })

  it('rejects undefined, empty and malformed tokens', () => {
    expect(isValidAdminToken(undefined)).toBe(false)
    expect(isValidAdminToken('')).toBe(false)
    expect(isValidAdminToken('nodot')).toBe(false)
    expect(isValidAdminToken('.')).toBe(false)
    expect(isValidAdminToken('abc.def')).toBe(false)
  })

  it('rejects a non-numeric expiry', () => {
    expect(isValidAdminToken(sign('not-a-number'))).toBe(false)
  })

  it('fails closed when the secret is not configured', () => {
    const token = signAdminToken()
    delete process.env.ADMIN_COOKIE_SECRET
    expect(isValidAdminToken(token)).toBe(false)
  })
})

describe('checkPassword', () => {
  it('accepts the configured password', () => {
    expect(checkPassword('correct horse battery staple')).toBe(true)
  })

  it('rejects a wrong password', () => {
    expect(checkPassword('wrong')).toBe(false)
  })

  it('rejects a prefix of the correct password', () => {
    expect(checkPassword('correct')).toBe(false)
  })

  it('fails closed when no password is configured', () => {
    delete process.env.ADMIN_PASSWORD
    expect(checkPassword('')).toBe(false)
    expect(checkPassword('anything')).toBe(false)
  })
})

describe('isAdminConfigured', () => {
  it('is true only when both password and secret are set', () => {
    expect(isAdminConfigured()).toBe(true)
    delete process.env.ADMIN_PASSWORD
    expect(isAdminConfigured()).toBe(false)
  })
})
