import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type UpdateSessionResult = {
  supabaseResponse: NextResponse
  user: User | null
}

/**
 * Refreshes the Supabase session on every request and returns both the
 * updated NextResponse (with refreshed cookies) and the current user.
 *
 * IMPORTANT: Do not add any logic between createServerClient() and
 * supabase.auth.getUser() — anything that short-circuits would prevent the
 * token refresh from running.
 */
export async function updateSession(
  request: NextRequest,
  requestHeaders?: Headers,
): Promise<UpdateSessionResult> {
  const nextOpts = requestHeaders
    ? { request: { headers: requestHeaders } }
    : { request }
  let supabaseResponse = NextResponse.next(nextOpts)

  // If Supabase isn't configured (e.g. preview deploy without env vars),
  // skip session refresh and treat the request as anonymous. The protected
  // routes /account and /admin still get gated by the middleware below.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return { supabaseResponse, user: null }
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies to the request so subsequent getAll() calls in this
          // middleware chain see the updated values.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          // Rebuild the response so the cookies propagate to the browser.
          supabaseResponse = NextResponse.next(nextOpts)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // getUser() validates the JWT against Supabase; never trust getSession() for
  // server-side auth decisions.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
