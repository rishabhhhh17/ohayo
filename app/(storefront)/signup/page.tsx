import type { Metadata } from 'next'
import { SignUpForm } from './signup-form'

export const metadata: Metadata = {
  title: 'Create account — Knitto',
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <SignUpForm />
    </main>
  )
}
