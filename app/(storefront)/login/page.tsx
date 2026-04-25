import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Sign in — Knitto',
}

interface LoginPageProps {
  searchParams: { next?: string }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <LoginForm next={searchParams.next} />
    </main>
  )
}
