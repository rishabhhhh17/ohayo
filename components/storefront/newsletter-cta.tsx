'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { subscribeToNewsletter } from './newsletter-action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
});

type FormFields = z.infer<typeof schema>;

type FormState = {
  ok: boolean;
  alreadySubscribed?: boolean;
  error?: string;
} | null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      aria-disabled={pending}
      className="h-12 shrink-0 rounded-full bg-cocoa px-7 text-sm font-bold uppercase tracking-wider text-cream hover:bg-cocoa/90"
    >
      {pending ? 'Sending…' : 'Get 10% off'}
    </Button>
  );
}

export function NewsletterCta() {
  const [state, formAction] = useFormState(subscribeToNewsletter, null);

  const {
    register,
    formState: { errors },
    reset,
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const toastedState = useRef<FormState>(null);

  useEffect(() => {
    if (!state || state === toastedState.current) return;
    toastedState.current = state;

    if (state.alreadySubscribed) {
      toast.info("You're already subscribed.");
    } else if (state.ok) {
      toast.success("You're on the list. Check your inbox for your code.");
      reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, reset]);

  return (
    <section aria-label="Newsletter sign-up" className="relative overflow-hidden bg-sun py-16 md:py-24">
      {/* Concentric ring decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-2 border-dashed border-cream/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full border-2 border-dashed border-cream/20"
      />

      <div className="container relative text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-cocoa text-cream font-display text-xl">
          ☼
        </div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-cream/80">
          Welcome offer
        </p>
        <h2 className="font-display text-cream text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-tight">
          10% off your <span className="font-editorial">first morning.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-base text-cream/85 leading-relaxed">
          Join the list for the welcome code, recipe ideas, and a heads-up on new drops.
        </p>

        <form
          action={formAction}
          noValidate
          className="mx-auto mt-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:items-start"
        >
          <div className="flex-1 space-y-1">
            <Label htmlFor="newsletter-email" className="sr-only">
              Email address
            </Label>
            <Input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              aria-describedby={errors.email ? 'newsletter-email-error' : undefined}
              aria-invalid={!!errors.email}
              {...register('email')}
              name="email"
              className="h-12 rounded-full border-cream/30 bg-cream-light px-5 text-base text-cocoa placeholder:text-cocoa/40 focus-visible:ring-cocoa"
            />
            {errors.email && (
              <p
                id="newsletter-email-error"
                role="alert"
                className="text-sm text-cream text-left pl-5"
              >
                {errors.email.message}
              </p>
            )}
          </div>
          <SubmitButton />
        </form>

        <p className="mt-4 text-xs text-cream/65">
          No spam. Unsubscribe any time.
        </p>
      </div>
    </section>
  );
}
