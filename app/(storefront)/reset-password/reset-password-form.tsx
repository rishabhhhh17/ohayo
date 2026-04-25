'use client'

import { useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { resetPassword } from './actions'

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type Fields = z.infer<typeof schema>

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending} aria-disabled={pending}>
      {pending ? 'Updating password…' : 'Set new password'}
    </Button>
  )
}

export function ResetPasswordForm() {
  const [state, formAction] = useFormState(resetPassword, null)

  const {
    register,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (state && !state.ok) {
      toast.error(state.error)
    }
    // On success the action calls redirect() — the toast won't fire here,
    // so we show it on the /account page via the `?reset=success` param.
  }, [state])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set new password</CardTitle>
        <CardDescription>Choose a strong password for your account.</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-1">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              aria-describedby={errors.password ? 'new-password-error' : undefined}
              aria-invalid={!!errors.password}
              {...register('password')}
              name="password"
            />
            {errors.password && (
              <p id="new-password-error" role="alert" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              aria-describedby={errors.confirm_password ? 'confirm-password-error' : undefined}
              aria-invalid={!!errors.confirm_password}
              {...register('confirm_password')}
              name="confirm_password"
            />
            {errors.confirm_password && (
              <p id="confirm-password-error" role="alert" className="text-sm text-destructive">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
