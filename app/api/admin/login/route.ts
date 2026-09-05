import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  ADMIN_TTL_SECONDS,
  checkPassword,
  isAdminConfigured,
  signAdminToken,
} from '@/lib/admin-auth'

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Admin is not configured.' }, { status: 503 })
  }

  const form = await request.formData()
  const password = String(form.get('password') ?? '')

  if (!checkPassword(password)) {
    return NextResponse.redirect(new URL('/admin/login?error=1', request.url), 303)
  }

  const response = NextResponse.redirect(new URL('/admin/orders', request.url), 303)
  response.cookies.set(ADMIN_COOKIE, signAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_TTL_SECONDS,
  })
  return response
}
