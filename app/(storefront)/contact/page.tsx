import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the BlendStart team for orders, returns, or general questions.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-3">
          Get in touch
        </h1>
        <p className="text-muted-foreground mb-10">
          We&apos;re a small team in Bengaluru. The fastest way to reach us is email — replies come
          within one business day.
        </p>

        <div className="space-y-4">
          <a
            href="mailto:hello@blendstart.com"
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/40"
          >
            <Mail className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">hello@blendstart.com</p>
            </div>
          </a>

          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/40"
          >
            <MessageCircle
              className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-foreground">WhatsApp</p>
              <p className="text-sm text-muted-foreground">+91 99999 99999 — Mon–Sat, 10–6</p>
            </div>
          </a>

          <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
            <Clock
              className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-foreground">Response time</p>
              <p className="text-sm text-muted-foreground">
                We aim to reply within one business day. Order-related queries are prioritised.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-xl bg-muted/50 px-5 py-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Tracking an order?</p>
          <p>
            Have your order number handy and visit our{' '}
            <Link href="/track" className="underline underline-offset-4 hover:text-foreground">
              order tracking page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
