'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { ok: true } | { ok: false; error: string }

export async function signIn(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || '/'

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { ok: false, error: 'Invalid email or password.' }
  }

  redirect(next)
}

export async function signInWithMagicLink(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get('email') as string
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    return { ok: false, error: 'Could not send magic link. Please try again.' }
  }

  return { ok: true }
}
