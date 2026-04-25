'use server'

import { createClient } from '@/lib/supabase/server'

type ActionResult = { ok: true } | { ok: false; error: string }

export async function requestPasswordReset(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get('email') as string
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const supabase = await createClient()

  // We intentionally ignore errors so we never reveal whether an email exists.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  // Always return success to avoid email enumeration.
  return { ok: true }
}
