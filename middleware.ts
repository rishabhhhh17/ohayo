import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Inject the current pathname as a request header so that Server Components
  // can read it via `headers()` from `next/headers`. This is needed by
  // guards.ts → requireUser() to build the `?next=<path>` redirect param.
  // We forward modified headers via NextResponse.next({ request: { headers } });
  // we cannot mutate request.headers directly (read-only on NextRequest).
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  // 1. Refresh the session and get the current user.
  const { supabaseResponse, user } = await updateSession(request, requestHeaders)

  // 2. Protect /account/* — must be authenticated.
  if (pathname.startsWith('/account')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return supabaseResponse
  }

  // 3. Protect /admin/* — must be authenticated AND have role = 'admin'.
  //    Return 404 (rewrite to /_not-found) rather than redirect to avoid
  //    leaking the existence of admin routes to unauthenticated visitors.
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.rewrite(new URL('/_not-found', request.url))
    }

    // Check the user's role in the profiles table using a lightweight
    // read-only client (cookies already refreshed by updateSession above).
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // Intentional no-op: cookie writes already handled by updateSession.
          },
        },
      },
    )

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.rewrite(new URL('/_not-found', request.url))
    }

    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static bundle files)
     * - _next/image   (image optimisation endpoint)
     * - favicon.ico, sitemap.xml, robots.txt
     * - any file with a known static extension
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)',
  ],
}
