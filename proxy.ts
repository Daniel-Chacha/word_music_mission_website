import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, isValidAdminToken } from '@/lib/admin-auth'

// Next 16 renamed Middleware to Proxy. This file must sit at the project root.
export function proxy(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value

  if (!isValidAdminToken(token)) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Everything under /admin except the login page and its POST handler.
  matcher: ['/admin', '/admin/orders/:path*'],
}
