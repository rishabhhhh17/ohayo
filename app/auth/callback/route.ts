import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Handles all Supabase auth redirects:
 * - Email confirmation links
 * - Magic link sign-ins
 * - Password reset links (exchanges code → session, then redirects to /reset-password)
 * - OAuth callbacks (Phase 6)
 *
 * The `code` query parameter is a PKCE code that must be exchanged for a session.
 * The `next` query parameter is an optional redirect destination.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Build the redirect URL — honour absolute `next` values from Supabase
      // (e.g. the `redirectTo` we pass in resetPasswordForEmail) but fall back
      // to a same-origin relative path.
      const redirectUrl = next.startsWith('/')
        ? `${origin}${next}`
        : next

      return NextResponse.redirect(redirectUrl)
    }
  }

  // On error, redirect to an error page (or back to login).
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
