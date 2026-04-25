import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About OHAYO — The morning fuel',
  description:
    'OHAYO is a premium breakfast drink mix built around one stubborn idea — that mornings should fuel the rest of your day, not be skipped over.',
};

export default function AboutPage() {
  return (
    <div className="bg-cream">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-rose/60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 bottom-0 h-[360px] w-[360px] rounded-full bg-sun/15 blur-3xl"
        />
        <div className="container relative z-10 max-w-3xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sun">
            Our story
          </p>
          <h1 className="font-display text-cocoa text-[clamp(3rem,7vw,5.5rem)] leading-[0.95] tracking-tight">
            Mornings are{' '}
            <span className="font-editorial text-sun">won</span>,
            <br />
            not granted.
          </h1>
          <p className="mt-7 text-base text-cocoa/70 md:text-lg md:leading-relaxed">
            OHAYO started with one stubborn idea — that the most important meal of the
            day shouldn&rsquo;t be the one you keep skipping. So we set out to build a
            single drink that does the job of a real breakfast: protein, fibre, fats,
            electrolytes — without the sugar bombs and 30-ingredient labels.
          </p>
        </div>
      </section>

      {/* ---------------- Image band ---------------- */}
      <section className="container mx-auto pb-16 md:pb-24">
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-3xl ring-1 ring-cocoa/10">
          <Image
            src="https://images.unsplash.com/photo-1493770348161-369560ae357d?w=2000&h=900&fit=crop&crop=entropy&auto=format&q=85"
            alt="A warm, sunlit breakfast spread on a wooden table"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
        </div>
      </section>

      {/* ---------------- Pillars ---------------- */}
      <section className="bg-rose/40">
        <div className="container mx-auto py-16 md:py-24">
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sun">
              How we build it
            </p>
            <h2 className="font-display text-cocoa text-[clamp(2rem,4.5vw,3.25rem)] leading-[1] tracking-tight">
              Three rules. <span className="font-editorial text-cocoa/70">No exceptions.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
            {[
              {
                n: '01',
                title: 'Real food, in powder form.',
                body: 'Whey isolate, oat fibre, Dutch-process cocoa, sea salt, MCT, electrolytes. Eight ingredients you can pronounce — nothing else.',
              },
              {
                n: '02',
                title: 'Sweet, but honest.',
                body: 'Caramelised coconut sugar and natural caramel flavour do the work. No artificial sweeteners, no protein-shake aftertaste.',
              },
              {
                n: '03',
                title: 'Tested every batch.',
                body: 'Every production run is third-party lab-tested for protein, sugar and contaminants. If the numbers slip, the batch doesn\u2019t ship.',
              },
            ].map((pillar) => (
              <div key={pillar.title}>
                <span className="font-display text-3xl text-sun">{pillar.n}</span>
                <h3 className="mt-2 font-display text-cocoa text-2xl tracking-tight md:text-3xl">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-base text-cocoa/70 leading-relaxed">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Values ---------------- */}
      <section className="container mx-auto py-16 md:py-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 md:items-center">
          <div className="relative aspect-square overflow-hidden rounded-3xl ring-1 ring-cocoa/10 md:order-2">
            <Image
              src="https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=900&h=900&fit=crop&crop=entropy&auto=format&q=85"
              alt="A scoop of cocoa powder on a warm beige surface"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute -left-4 -top-4 h-20 w-20 rounded-full bg-sun shadow-sun"
            />
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sun">
              What we believe
            </p>
            <h2 className="font-display text-cocoa text-[clamp(2rem,4.5vw,3.25rem)] leading-[1] tracking-tight">
              Breakfast isn&rsquo;t optional.
            </h2>
            <div className="mt-6 space-y-4 text-base text-cocoa/70 leading-relaxed">
              <p>
                Most &ldquo;breakfast&rdquo; products are dessert in disguise — sugar bombs
                that crash you by 11am. We make ours the other way around: real macros
                first, then we made it taste like dessert anyway.
              </p>
              <p>
                That means 23g of complete protein. 11g of prebiotic fibre. Electrolytes
                for the salt your body actually needs. And the kind of salted caramel
                cocoa flavour that makes the alarm clock feel less hostile.
              </p>
              <p>
                We&rsquo;re a small team based out of Bengaluru, shipping pan-India and
                growing one morning at a time. Thanks for being here.
              </p>
            </div>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-cocoa px-7 py-6 text-sm font-bold uppercase tracking-wider text-cream hover:bg-cocoa/90"
              >
                <Link href="/products">Shop OHAYO</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
