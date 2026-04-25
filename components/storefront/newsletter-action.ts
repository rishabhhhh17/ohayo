'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

type FormState = {
  ok: boolean;
  alreadySubscribed?: boolean;
  error?: string;
} | null;

export async function subscribeToNewsletter(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = schema.safeParse({ email: formData.get('email') });

  if (!parsed.success) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  const { email } = parsed.data;

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email });

    if (error) {
      // PostgreSQL unique violation code
      if (error.code === '23505') {
        return { ok: false, alreadySubscribed: true };
      }
      console.error('Newsletter insert error:', error.message);
      return { ok: false, error: 'Something went wrong. Please try again.' };
    }

    return { ok: true };
  } catch (err) {
    console.error('Newsletter action error:', err);
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}
