/**
 * Pick your blend — two-up product variants (Balanced vs Performance).
 *
 * Replaces the legacy "category tiles" with a focused product comparison
 * tailored to BlendStart's only SKU: Salted Caramel Cocoa, in two formulations.
 */

import Link from 'next/link';
import { Check } from 'lucide-react';
import { BlendStartPouch } from '@/components/storefront/blendstart-pouch';
import { Button } from '@/components/ui/button';

const VARIANTS = [
  {
    key: 'balanced' as const,
    name: 'Balanced',
    eyebrow: 'For everyone, every morning',
    price: '₹1,299',
    perServing: '₹65 / serving',
    bg: 'bg-rose-soft',
    blob: 'bg-rose/70',
    features: [
      '23g complete protein',
      '11g prebiotic fibre',
      'Electrolyte blend',
      '4g net carbs',
    ],
    href: '/products?variant=balanced',
  },
  {
    key: 'performance' as const,
    name: 'Performance',
    eyebrow: 'For training mornings',
    price: '₹1,499',
    perServing: '₹75 / serving',
    bg: 'bg-cream-light',
    blob: 'bg-sun/30',
    features: [
      '23g complete protein',
      '11g prebiotic fibre',
      '3g creatine monohydrate',
      'Electrolyte blend',
    ],
    href: '/products?variant=performance',
  },
];

export function CategoryTiles() {
  return (
    <section
      id="blends"
      aria-label="Pick your blend"
      className="relative bg-cream py-20 md:py-28"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sun">
            Pick your blend
          </p>
          <h2 className="font-display text-cocoa text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-tight">
            One flavour. <span className="font-editorial text-cocoa/70">Two tempos.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-cocoa/65 leading-relaxed">
            Both blends share the same salted-caramel-cocoa soul. Pick Balanced for
            everyday mornings, or Performance when you&rsquo;re training.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {VARIANTS.map((v) => (
            <article
              key={v.key}
              className={`group relative overflow-hidden rounded-3xl ${v.bg} p-8 ring-1 ring-cocoa/10 transition-all hover:-translate-y-1 hover:shadow-lift sm:p-10`}
            >
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full ${v.blob} blur-2xl`}
              />

              <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cocoa/60">
                    {v.eyebrow}
                  </p>
                  <h3 className="mt-2 font-display text-cocoa text-5xl tracking-tight md:text-6xl">
                    {v.name}
                  </h3>

                  <ul className="mt-6 space-y-2.5">
                    {v.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-cocoa/85">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cocoa text-cream">
                          <Check size={12} strokeWidth={3} aria-hidden="true" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 flex items-baseline gap-3">
                    <span className="font-display text-3xl text-cocoa">{v.price}</span>
                    <span className="text-sm text-cocoa/55">{v.perServing}</span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full bg-cocoa px-6 text-sm font-bold uppercase tracking-wider text-cream hover:bg-cocoa/90"
                    >
                      <Link href={v.href}>Shop {v.name}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className="rounded-full px-3 text-sm font-semibold text-cocoa/80 underline-offset-4 hover:bg-transparent hover:underline"
                    >
                      <Link href={v.href}>Details →</Link>
                    </Button>
                  </div>
                </div>

                <div className="relative w-full max-w-[180px] shrink-0 self-center sm:max-w-[200px]">
                  <BlendStartPouch variant={v.key} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
