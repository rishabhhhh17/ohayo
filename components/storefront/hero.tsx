/**
 * Hero — BlendStart morning fuel
 *
 * Two-column layout:
 *   Left  — chunky display headline, sub, dual CTA, social proof, value props
 *   Right — layered "still life" of two pouches + a glass of cocoa, with a
 *           large rotating sun-disc behind for the brand motif.
 *
 * Uses the BlendStartPouch CSS component so the hero never depends on a missing
 * image asset — every element renders from tokens.
 */

import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlendStartPouch } from '@/components/storefront/blendstart-pouch';

export function Hero() {
  return (
    <section
      aria-label="Hero"
      className="relative overflow-hidden bg-cream pt-28 pb-16 md:pt-36 md:pb-24"
    >
      {/* Soft rose blob — top right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-[480px] w-[480px] rounded-full bg-rose/60 blur-3xl"
      />
      {/* Subtle warm wash bottom-left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-0 h-[420px] w-[420px] rounded-full bg-sun/15 blur-3xl"
      />

      <div className="container relative z-10 grid grid-cols-1 items-center gap-14 md:grid-cols-12 md:gap-12">
        {/* ---------------- Copy ---------------- */}
        <div className="md:col-span-6">
          {/* Eyebrow pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cocoa/10 bg-cream-light/80 px-3.5 py-1.5 backdrop-blur">
            <span className="blendstart-sun h-2 w-2" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cocoa/75">
              The Morning Fuel
            </span>
          </div>

          <h1 className="font-display text-cocoa text-[clamp(3rem,9vw,7rem)] leading-[0.92] tracking-tight">
            Morning,
            <br />
            <span className="relative inline-block">
              in a glass.
              {/* Editorial underline accent */}
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-[8px] w-full rounded-full bg-sun/80"
              />
            </span>
          </h1>

          <p className="mt-7 max-w-md text-base text-cocoa/70 sm:text-lg leading-relaxed">
            Breakfast you actually look forward to. <span className="font-editorial">Salted caramel cocoa</span> with{' '}
            <strong className="font-semibold text-cocoa">23g protein, 11g fibre,</strong> and electrolytes —
            ready in 20 seconds.
          </p>

          {/* CTA row */}
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-cocoa px-7 py-6 text-base font-bold uppercase tracking-wider text-cream shadow-lift hover:bg-cocoa/90"
            >
              <Link href="/products">Shop BlendStart</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="rounded-full px-5 py-6 text-base font-semibold text-cocoa underline-offset-4 hover:bg-cocoa/5 hover:underline"
            >
              <Link href="#how">How it works →</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2" aria-hidden="true">
              {[
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format&q=80',
              ].map((src) => (
                <span
                  key={src}
                  className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-cream"
                >
                  <Image src={src} alt="" fill sizes="40px" className="object-cover" />
                </span>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="fill-sun text-sun" />
                ))}
              </div>
              <div className="text-xs font-medium text-cocoa/65">
                Loved by 8,000+ early risers
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- Visual: pouch + glass + sun ---------------- */}
        <div className="md:col-span-6">
          <div className="relative mx-auto h-[460px] w-full max-w-[560px] sm:h-[540px] md:h-[600px]">
            {/* Big sun-disc backdrop — slow rotation */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 sm:h-[460px] sm:w-[460px] md:h-[520px] md:w-[520px]"
            >
              <div className="blendstart-sun h-full w-full animate-spin-slow opacity-95" />
              {/* Concentric ring */}
              <div className="absolute inset-[-20px] rounded-full border-2 border-dashed border-cocoa/15" />
            </div>

            {/* Cocoa drink glass — bottom left */}
            <div className="absolute bottom-[6%] left-[2%] z-20 h-[58%] w-[34%]">
              <DrinkGlass />
            </div>

            {/* Performance pouch — center, slight rotate */}
            <div className="absolute right-[8%] top-[6%] z-30 w-[48%] sm:w-[44%]">
              <BlendStartPouch variant="performance" rotate={4} />
            </div>

            {/* Balanced pouch — back, peeking from behind */}
            <div className="absolute left-[24%] top-[14%] z-10 w-[34%] opacity-90">
              <BlendStartPouch variant="balanced" rotate={-10} />
            </div>

            {/* Floating "23g protein" sticker */}
            <div className="absolute right-[2%] top-[2%] z-40 flex h-20 w-20 rotate-12 flex-col items-center justify-center rounded-full bg-cocoa text-center font-display text-cream shadow-lift sm:h-24 sm:w-24">
              <span className="text-[1.5rem] leading-none sm:text-[1.75rem]">23g</span>
              <span className="mt-0.5 text-[0.5rem] font-sans font-semibold uppercase tracking-[0.12em] text-cream/80 sm:text-[0.55rem]">
                Protein
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Pure-CSS glass of cocoa, used inside the hero composition.
 */
function DrinkGlass() {
  return (
    <div className="relative h-full w-full" aria-hidden="true">
      {/* Glass body */}
      <div className="absolute inset-x-0 bottom-0 h-[88%] overflow-hidden rounded-b-[18%] rounded-t-[8%] bg-gradient-to-b from-cocoa/85 via-[#3d2218] to-[#5b3624] shadow-lift ring-1 ring-cocoa/10">
        {/* Liquid surface highlight (foam-like) */}
        <div className="absolute inset-x-[6%] top-[4%] h-[3%] rounded-full bg-cream/10 blur-sm" />
        {/* Vertical glass highlight */}
        <div className="absolute inset-y-[4%] left-[8%] w-[4%] rounded-full bg-white/15 blur-[2px]" />
        <div className="absolute inset-y-[14%] right-[10%] w-[2%] rounded-full bg-white/10 blur-[1px]" />
      </div>
      {/* Straw */}
      <div className="absolute left-[28%] top-0 h-[60%] w-[6%] -rotate-6 rounded-full bg-gradient-to-b from-cream-light to-cocoa/20 shadow-sm" />
      {/* Glass rim */}
      <div className="absolute inset-x-0 top-[12%] h-[2%] rounded-full bg-cream-light/30" />
    </div>
  );
}
