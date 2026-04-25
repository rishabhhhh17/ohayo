import type { Metadata } from 'next'
import { requireUser, getProfile } from '@/lib/supabase/guards'
import { signOut } from './actions'
import { ResetSuccessToast } from './reset-success-toast'

export const metadata: Metadata = {
  title: 'My account — Knitto',
}

interface AccountPageProps {
  searchParams: { reset?: string }
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  // requireUser() redirects to /login?next=/account if not authenticated.
  const { user } = await requireUser()
  const profile = await getProfile(user.id)

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-6">
      {/* Fire a toast when redirected here after a successful password reset */}
      {searchParams.reset === 'success' && <ResetSuccessToast />}

      <h1 className="text-2xl font-semibold">My account</h1>

      <section className="space-y-2 text-sm">
        <p>
          <span className="text-muted-foreground">Email: </span>
          {user.email}
        </p>
        {profile?.full_name && (
          <p>
            <span className="text-muted-foreground">Name: </span>
            {profile.full_name}
          </p>
        )}
        <p>
          <span className="text-muted-foreground">Role: </span>
          {profile?.role ?? 'customer'}
        </p>
      </section>

      {/* Logout form — uses a server action so no JS required */}
      <form action={signOut}>
        <button
          type="submit"
          className="text-sm text-destructive hover:underline"
        >
          Sign out
        </button>
      </form>
    </main>
  )
}
