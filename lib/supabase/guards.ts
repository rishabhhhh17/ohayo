import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { User, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

// ---------------------------------------------------------------------------
// getUser
// ---------------------------------------------------------------------------
/**
 * Returns the current authenticated user and a typed Supabase client.
 * Uses auth.getUser() (JWT-validated) rather than getSession() (cache-only).
 */
export async function getUser(): Promise<{
  user: User | null
  supabase: SupabaseClient<Database>
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { user, supabase }
}

// ---------------------------------------------------------------------------
// requireUser
// ---------------------------------------------------------------------------
/**
 * Throws a redirect to /login?next=<current-path> if the visitor is not
 * authenticated. Returns the user if they are.
 */
export async function requireUser(): Promise<{
  user: User
  supabase: SupabaseClient<Database>
}> {
  const { user, supabase } = await getUser()

  if (!user) {
    const headersList = await headers()
    const currentPath = headersList.get('x-pathname') ?? '/'
    redirect(`/login?next=${encodeURIComponent(currentPath)}`)
  }

  return { user, supabase }
}

// ---------------------------------------------------------------------------
// requireAdmin
// ---------------------------------------------------------------------------
/**
 * Ensures the visitor is authenticated AND has role = 'admin' in profiles.
 * Calls notFound() if either condition fails.
 */
export async function requireAdmin(): Promise<User> {
  const { user, supabase } = await requireUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    notFound()
  }

  return user
}

// ---------------------------------------------------------------------------
// getProfile
// ---------------------------------------------------------------------------
/**
 * Fetches the profile row for a given user ID.
 * Returns null if not found or on error.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data ?? null
}
