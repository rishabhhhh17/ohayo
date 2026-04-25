import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /logout
 *
 * Convenience route for testing — signs the user out and redirects to /.
 * In production the user should sign out via the account page form action.
 */
export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', _request.url))
}
