import { requireAdmin } from '@/lib/supabase/guards'

/**
 * Admin dashboard — Phase 2 placeholder.
 * Full implementation comes in Phase 8.
 * requireAdmin() handles auth + role check; middleware also enforces this.
 */
export default async function AdminDashboardPage() {
  await requireAdmin()

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Dashboard content coming in Phase 8.
      </p>
    </main>
  )
}
