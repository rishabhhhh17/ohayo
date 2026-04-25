'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { ok: true } | { ok: false; error: string }

export async function resetPassword(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (password !== confirmPassword) {
    return { ok: false, error: 'Passwords do not match.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { ok: false, error: 'Could not update password. The reset link may have expired.' }
  }

  redirect('/account?reset=success')
}
