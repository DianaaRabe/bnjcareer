// ─────────────────────────────────────────────────────────────────────────────
// Middleware — Tenant Detection + Auth Routing
//
// Order of operations:
//   1. Detect tenant from hostname (or ?tenant= query param in dev)
//   2. Inject x-tenant-id header on every response
//   3. Handle auth routing (protect /dashboard, /coach, /admin routes)
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  resolveTenantFromHostname,
  resolveTenantFromQuery,
  getTenantConfig,
  DEFAULT_TENANT,
} from './tenants/registry'
import type { TenantId } from './tenants/types'

export const TENANT_HEADER = 'x-tenant-id'

export const TENANT_COOKIE = 'x-tenant-id'

export async function middleware(request: NextRequest) {
  // ── 1. Tenant Detection ──────────────────────────────────────────────────
  // Priority: ?tenant= query param > cookie (set by previous visit) > hostname > default
  const hostname    = request.headers.get('host') ?? ''
  const tenantQuery = request.nextUrl.searchParams.get('tenant')
  const tenantCookie = request.cookies.get(TENANT_COOKIE)?.value as TenantId | undefined

  const tenantId: TenantId =
    resolveTenantFromQuery(tenantQuery) ??
    (tenantCookie && tenantCookie in { fr: 1, africa: 1, community: 1 } ? tenantCookie : null) ??
    resolveTenantFromHostname(hostname) ??
    DEFAULT_TENANT

  const tenantConfig = getTenantConfig(tenantId)

  // ── 2. Build response with tenant header ─────────────────────────────────
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(TENANT_HEADER, tenantId)

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  response.headers.set(TENANT_HEADER, tenantId)

  // Persist the tenant in a session cookie so navigation stays on the right tenant
  // without requiring ?tenant= on every URL (critical for dev with no subdomains)
  if (tenantId !== (tenantCookie ?? DEFAULT_TENANT) || !tenantCookie) {
    response.cookies.set(TENANT_COOKIE, tenantId, {
      path: '/',
      sameSite: 'lax',
      // No maxAge → session cookie; cleared when browser closes
    })
  }

  // ── 3. Auth via Supabase ─────────────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: { headers: requestHeaders },
          })
          response.headers.set(TENANT_HEADER, tenantId)
          // Re-apply the tenant cookie whenever Supabase rebuilds the response
          response.cookies.set(TENANT_COOKIE, tenantId, { path: '/', sameSite: 'lax' })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isDashboardRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  const isCoachRoute     = pathname === '/coach'     || pathname.startsWith('/coach/')
  const isAdminRoute     = pathname === '/admin'     || pathname.startsWith('/admin/')
  const isLoginRoute     = pathname === '/login' || pathname === '/coach-login'

  if (user) {
    if (isDashboardRoute || isCoachRoute || isAdminRoute || isLoginRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = profile?.role ?? 'candidate'

      // Whether this tenant has an admin dashboard at all
      const hasAdminDashboard = tenantConfig.features.adminDashboard

      // Role-based route protection
      // Coach → always redirect to /coach space
      if (isDashboardRoute && role === 'coach') {
        return redirectTo(request, '/coach', tenantId)
      }
      // Admin → only redirect to /admin if the tenant actually has one
      // (FR/Africa have no admin dashboard → admins use /dashboard normally)
      if (isDashboardRoute && role === 'admin' && hasAdminDashboard) {
        return redirectTo(request, '/admin', tenantId)
      }

      if (isCoachRoute && role !== 'coach') {
        // Non-coach on /coach → send to their correct space
        const dest = role === 'candidate' ? '/dashboard'
          : (role === 'admin' && hasAdminDashboard) ? '/admin'
          : '/dashboard'
        return redirectTo(request, dest, tenantId)
      }
      if (isAdminRoute && role !== 'admin') {
        return redirectTo(request, role === 'coach' ? '/coach' : '/dashboard', tenantId)
      }

      // Feature flag: block /admin for tenants without adminDashboard
      // (must come before login redirect so admins on FR aren't bounced to /admin)
      if (isAdminRoute && !hasAdminDashboard) {
        return redirectTo(request, '/dashboard', tenantId)
      }

      // Redirect away from login pages if already authenticated
      if (isLoginRoute) {
        let dest = '/dashboard'
        if (role === 'coach') dest = '/coach'
        else if (role === 'admin' && hasAdminDashboard) dest = '/admin'
        return redirectTo(request, dest, tenantId)
      }
    }
  } else {
    // Unauthenticated — protect private routes
    if (isDashboardRoute) return redirectTo(request, '/login', tenantId)
    if (isCoachRoute)     return redirectTo(request, '/coach-login', tenantId)
    if (isAdminRoute)     return redirectTo(request, '/login', tenantId)
  }

  return response
}

function redirectTo(request: NextRequest, pathname: string, tenantId: TenantId): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  const res = NextResponse.redirect(url)
  res.headers.set(TENANT_HEADER, tenantId)
  res.cookies.set(TENANT_COOKIE, tenantId, { path: '/', sameSite: 'lax' })
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
