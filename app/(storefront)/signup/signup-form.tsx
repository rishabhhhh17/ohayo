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
import { signUp } from './actions'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const signUpSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Name is too long'),
  email: z.string().email('Enter a valid email').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
})

type SignUpFields = z.infer<typeof signUpSchema>

// ---------------------------------------------------------------------------
// Submit button
// ---------------------------------------------------------------------------
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending} aria-disabled={pending}>
      {pending ? 'Creating account…' : 'Create account'}
    </Button>
  )
}

// ---------------------------------------------------------------------------
// SignUpForm
// ---------------------------------------------------------------------------
export function SignUpForm() {
  const [state, formAction] = useFormState(signUp, null)

  const {
    register,
    formState: { errors },
  } = useForm<SignUpFields>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!state) return
    if (!state.ok) {
      toast.error(state.error)
    } else {
      toast.success('Account created! Check your email to confirm your address.')
    }
  }, [state])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Join Knitto for premium socks</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          {/* Full name */}
          <div className="space-y-1">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              type="text"
              autoComplete="name"
              aria-describedby={errors.full_name ? 'full-name-error' : undefined}
              aria-invalid={!!errors.full_name}
              {...register('full_name')}
              name="full_name"
            />
            {errors.full_name && (
              <p id="full-name-error" role="alert" className="text-sm text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              aria-describedby={errors.email ? 'signup-email-error' : undefined}
              aria-invalid={!!errors.email}
              {...register('email')}
              name="email"
            />
            {errors.email && (
              <p id="signup-email-error" role="alert" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              aria-describedby={errors.password ? 'signup-password-error' : undefined}
              aria-invalid={!!errors.password}
              {...register('password')}
              name="password"
            />
            {errors.password && (
              <p id="signup-password-error" role="alert" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <SubmitButton />
        </form>
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-foreground font-medium hover:underline ml-1">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
