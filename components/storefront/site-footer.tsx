import Link from 'next/link';
import { Mail } from 'lucide-react';
import { BlendStartLogo } from '@/components/storefront/blendstart-logo';

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const FOOTER_COLUMNS = [
  {
    heading: 'Shop',
    links: [
      { label: 'All blends', href: '/products' },
      { label: 'Balanced', href: '/products/blendstart-balanced-salted-caramel-cocoa' },
      { label: 'Performance', href: '/products/blendstart-performance-salted-caramel-cocoa' },
    ],
  },
  {
    heading: 'Learn',
    links: [
      { label: 'Why BlendStart', href: '/#brand-story' },
      { label: 'Nutrition', href: '/#nutrition' },
      { label: 'How it works', href: '/#how' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { label: 'Track order', href: '/track' },
      { label: 'Shipping policy', href: '/shipping' },
      { label: 'Refund policy', href: '/refunds' },
      { label: 'Contact us', href: '/contact' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Our story', href: '/about' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms & conditions', href: '/terms' },
    ],
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-cocoa/10 bg-cream-light" aria-label="Site footer">
      {/* Brand panel */}
      <div className="border-b border-cocoa/10 bg-cream">
        <div className="container grid grid-cols-1 items-center gap-8 py-12 md:grid-cols-2 md:gap-12">
          <div>
            <BlendStartLogo className="text-4xl md:text-5xl" />
            <p className="mt-4 max-w-md font-editorial text-xl leading-snug text-cocoa/80 md:text-2xl">
              &ldquo;Mornings are won, not granted.&rdquo;
            </p>
            <p className="mt-2 text-sm text-cocoa/55">— made with care in Bengaluru</p>
          </div>

          <div className="flex flex-col items-start gap-4 md:items-end">
            <div className="flex items-center gap-2">
              <Link
                href="https://instagram.com/blendstart"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BlendStart on Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-cocoa text-cream transition-transform hover:scale-105"
              >
                <InstagramIcon size={18} />
              </Link>
              <a
                href="mailto:hello@blendstart.com"
                aria-label="Email BlendStart"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-cocoa text-cream transition-transform hover:scale-105"
              >
                <Mail size={18} aria-hidden="true" />
              </a>
            </div>
            <p className="text-sm text-cocoa/60">@blendstart · hello@blendstart.com</p>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="container py-12 md:py-16">
        <div className="hidden gap-8 md:grid md:grid-cols-4">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-cocoa/55">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-cocoa/75 transition-colors hover:text-cocoa"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-px md:hidden">
          {FOOTER_COLUMNS.map((col) => (
            <details key={col.heading} className="group border-b border-cocoa/15 last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-bold uppercase tracking-wider text-cocoa">
                {col.heading}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 rotate-0 text-cocoa/50 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>
              <ul className="space-y-3 pb-4 pt-1">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-cocoa/70 hover:text-cocoa"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>

      {/* Promo strip */}
      <div className="border-t border-cocoa/10 bg-cream">
        <div className="container py-5 text-center">
          <p className="text-sm text-cocoa/80">
            Use code{' '}
            <span className="font-mono font-bold text-cocoa">WELCOME15</span>{' '}
            for <span className="font-bold">15% off</span> your first order.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cocoa/10 bg-cocoa text-cream">
        <div className="container flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-cream/65">
            &copy; {year} BlendStart. All rights reserved.
          </p>
          <p className="text-xs text-cream/65">
            FSSAI Lic. No. ••••• · Manufactured in India
          </p>
        </div>
      </div>
    </footer>
  );
}
