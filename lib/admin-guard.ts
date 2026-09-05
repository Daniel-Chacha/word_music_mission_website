import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE, isValidAdminToken } from './admin-auth'

/**
 * Enforces the admin session inside the page itself.
 *
 * proxy.ts already redirects unauthenticated requests, but that is an
 * optimistic check, not the authorization boundary: Next's own docs say Proxy
 * "should not be used as a full session management or authorization solution",
 * and middleware-bypass bugs have shipped in Next before (CVE-2025-29927).
 *
 * So every admin page calls this before reading any data. Losing the proxy —
 * to a bypass, or to someone adding an /admin route the matcher misses —
 * must not be enough to expose customer orders.
 *
 * This is deliberately kept out of lib/admin-auth.ts so that module stays free
 * of next/headers and remains importable from proxy.ts.
 */
export async function requireAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!isValidAdminToken(token)) redirect('/admin/login')
}
