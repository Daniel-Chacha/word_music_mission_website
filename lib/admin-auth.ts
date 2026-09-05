import { createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_COOKIE = 'wmt_admin'
export const ADMIN_TTL_SECONDS = 60 * 60 * 12

function secret(): string {
  const value = process.env.ADMIN_COOKIE_SECRET
  if (!value) throw new Error('ADMIN_COOKIE_SECRET is not configured')
  return value
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  // Length is not itself a secret, and timingSafeEqual throws if it differs.
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_COOKIE_SECRET)
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  return safeEqual(candidate, expected)
}

/** Returns `<expiry>.<hmac>`. */
export function signAdminToken(): string {
  const expiry = String(Date.now() + ADMIN_TTL_SECONDS * 1000)
  const signature = createHmac('sha256', secret()).update(expiry).digest('hex')
  return `${expiry}.${signature}`
}

export function isValidAdminToken(token?: string): boolean {
  if (!token) return false
  if (!process.env.ADMIN_COOKIE_SECRET) return false

  const [expiry, signature] = token.split('.')
  if (!expiry || !signature) return false

  const expiresAt = Number(expiry)
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false

  const expected = createHmac('sha256', secret()).update(expiry).digest('hex')
  return safeEqual(signature, expected)
}
