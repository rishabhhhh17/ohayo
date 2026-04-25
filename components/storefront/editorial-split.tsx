/**
 * Editorial split — brand story.
 *
 * Two alternating image/text sections that establish the BlendStart voice.
 */

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const SECTIONS = [
  {
    eyebrow: 'Our story',
    title: 'Good mornings, on purpose.',
    body: 'BlendStart began with a question: why does breakfast keep losing? Cereal is sugar. Bars are candy. Coffee is not a meal. We spent two years formulating a single drink that tastes like dessert and behaves like a meal — so the most important meal of the day actually shows up.',
    cta: { label: 'Read our story', href: '/about' },
    img: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=1200&h=1400&fit=crop&crop=entropy&auto=format&q=85',
    imgAlt: 'A warm, sunlit breakfast spread on a wooden table',
    imageRight: false,
  },
  {
    eyebrow: 'Our promise',
    title: 'Real food, in powder form.',
    body: "Whey isolate, oat fibre, real Dutch-process cocoa, sea salt and caramel. No artificial sweeteners, no protein-shake aftertaste, no 30-ingredient labels. Just breakfast — distilled, scooped, and ready when you are.",
    cta: { label: 'See the ingredients', href: '#nutrition' },
    img: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=1200&h=1400&fit=crop&crop=entropy&auto=format&q=85',
    imgAlt: 'A scoop of cocoa powder spilling onto a warm beige surface',
    imageRight: true,
  },
] as const;

export function EditorialSplit() {
  return (
    <section
      id="brand-story"
      aria-label="Brand story"
      className="bg-cream py-20 md:py-32"
    >
      <div className="container space-y-24 md:space-y-32">
        {SECTIONS.map((s) => (
          <div
            key={s.title}
            className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-16"
          >
            {/* Image */}
            <div
              className={`relative md:col-span-6 ${
                s.imageRight ? 'md:order-2' : ''
              }`}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-lift ring-1 ring-cocoa/5">
                <Image
                  src={s.img}
                  alt={s.imgAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
              {/* Floating sun */}
              <div
                aria-hidden="true"
                className={`absolute h-20 w-20 rounded-full bg-sun shadow-sun ${
                  s.imageRight ? '-left-4 -top-4' : '-right-4 -top-4'
                }`}
              />
            </div>

            {/* Copy */}
            <div className={`md:col-span-6 ${s.imageRight ? 'md:order-1' : ''}`}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sun">
                {s.eyebrow}
              </p>
              <h2 className="font-display text-cocoa text-[clamp(2rem,4.5vw,3.5rem)] leading-[1] tracking-tight">
                {s.title}
              </h2>
              <p className="mt-6 max-w-md text-base text-cocoa/70 leading-relaxed sm:text-lg">
                {s.body}
              </p>
              <div className="mt-7">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-cocoa bg-transparent px-6 text-sm font-bold uppercase tracking-wider text-cocoa hover:bg-cocoa hover:text-cream"
                >
                  <Link href={s.cta.href}>{s.cta.label}</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
