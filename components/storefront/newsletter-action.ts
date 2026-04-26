'use server';

import { z } from 'zod';

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

  console.log(`[NEWSLETTER] subscribe — ${parsed.data.email}`);

  return { ok: true };
}
