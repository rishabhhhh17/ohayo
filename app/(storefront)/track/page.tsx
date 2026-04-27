import type { Metadata } from 'next';
import { Mail, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Track Order',
  description: 'Track the status of your BlendStart order.',
};

export default function TrackPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-3">
          Track your order
        </h1>
        <p className="text-muted-foreground mb-8">
          We send a tracking link to your email as soon as your package leaves our warehouse.
        </p>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Search
              className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-foreground">Check your inbox</p>
              <p className="text-sm text-muted-foreground">
                Search for the most recent email from{' '}
                <span className="font-medium text-foreground">hello@blendstart.com</span> with the
                subject line &ldquo;Your BlendStart order is on the way&rdquo; — the courier
                tracking link is at the bottom.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail
              className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-foreground">Can&apos;t find it?</p>
              <p className="text-sm text-muted-foreground">
                Email{' '}
                <a
                  href="mailto:hello@blendstart.com"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  hello@blendstart.com
                </a>{' '}
                with your order number (it starts with{' '}
                <span className="font-mono">BS-</span>) and we&apos;ll resend the tracking link
                within one business day.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
