'use client'

import { useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { signIn, signInWithMagicLink } from './actions'

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email('Enter a valid email').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
})

type LoginFields = z.infer<typeof loginSchema>

// ---------------------------------------------------------------------------
// Pending-aware submit button
// ---------------------------------------------------------------------------
function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending} aria-disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  )
}

// ---------------------------------------------------------------------------
// LoginForm
// ---------------------------------------------------------------------------
export function LoginForm({ next }: { next?: string }) {
  const [signInState, signInAction] = useFormState(signIn, null)
  const [magicState, magicAction] = useFormState(signInWithMagicLink, null)

  const {
    register,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  // Surface server-side errors/successes via toast
  useEffect(() => {
    if (signInState && !signInState.ok) toast.error(signInState.error)
  }, [signInState])

  useEffect(() => {
    if (!magicState) return
    if (!magicState.ok) {
      toast.error(magicState.error)
    } else {
      toast.success('Magic link sent — check your inbox.')
    }
  }, [magicState])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Welcome back to Knitto</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ---- Email + password form ---- */}
        <form action={signInAction} className="space-y-4" noValidate>
          {next && <input type="hidden" name="next" value={next} />}

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
              {...register('email')}
              name="email"
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-describedby={errors.password ? 'password-error' : undefined}
              aria-invalid={!!errors.password}
              {...register('password')}
              name="password"
            />
            {errors.password && (
              <p id="password-error" role="alert" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <SubmitButton label="Sign in" pendingLabel="Signing in…" />
        </form>

        {/* ---- Divider ---- */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* ---- Magic link form — has its own email field ---- */}
        <form action={magicAction} className="space-y-3" noValidate>
          <div className="space-y-1">
            <Label htmlFor="magic-email">Email for magic link</Label>
            <Input
              id="magic-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <SubmitButton label="Send magic link" pendingLabel="Sending…" />
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground">
        <Link href="/forgot-password" className="hover:underline">
          Forgot password?
        </Link>
        <span>
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-foreground font-medium hover:underline"
          >
            Sign up
          </Link>
        </span>
      </CardFooter>
    </Card>
  )
}
