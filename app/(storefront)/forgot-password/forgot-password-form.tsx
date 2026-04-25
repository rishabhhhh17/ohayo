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
import { requestPasswordReset } from './actions'

const schema = z.object({
  email: z.string().email('Enter a valid email').toLowerCase().trim(),
})

type Fields = z.infer<typeof schema>

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending} aria-disabled={pending}>
      {pending ? 'Sending…' : 'Send reset link'}
    </Button>
  )
}

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(requestPasswordReset, null)

  const {
    register,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!state) return
    // Always show success to prevent email enumeration.
    toast.success('If that email is registered, you\'ll receive a reset link shortly.')
  }, [state])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send a reset link if the address is registered.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-1">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              aria-describedby={errors.email ? 'reset-email-error' : undefined}
              aria-invalid={!!errors.email}
              {...register('email')}
              name="email"
            />
            {errors.email && (
              <p id="reset-email-error" role="alert" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <SubmitButton />
        </form>
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        <Link href="/login" className="hover:underline">
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
