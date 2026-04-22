import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isCoachRoute = pathname === '/coach' || pathname.startsWith('/coach/');
  const isLoginRoute = pathname === '/login' || pathname === '/coach-login';

  if (user) {
    if (isDashboardRoute || isCoachRoute || isLoginRoute) {
      // User is authenticated, check their actual DB role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      const role = profile?.role || 'candidate';

      if (isDashboardRoute && role !== 'candidate') {
        const url = request.nextUrl.clone();
        url.pathname = '/coach';
        return NextResponse.redirect(url);
      }

      if (isCoachRoute && role !== 'coach') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }

      if (isLoginRoute) {
        const url = request.nextUrl.clone();
        url.pathname = role === 'coach' ? '/coach' : '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  } else {
    // User is NOT authenticated
    if (isDashboardRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    if (isCoachRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/coach-login';
      return NextResponse.redirect(url);
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (Supabase PKCE OAuth callback — must NOT be intercepted)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
