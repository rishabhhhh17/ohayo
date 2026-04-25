import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Knitto — Premium socks, made for every step',
  description:
    'Knitto is a premium sock label built around one stubborn idea — that the small things you wear every day deserve the same care as the big ones.',
};

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-primary/25 blur-3xl"
        />
        <div className="container relative z-10 max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Our story
          </p>
          <h1 className="mt-3 font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            We obsess over the
            <br />
            <span className="italic text-primary">small stuff</span>.
          </h1>
          <p className="mt-6 text-base text-foreground/70 md:text-lg md:leading-relaxed">
            Knitto started in 2024 with a stubborn idea — that the small things you wear
            every day deserve the same care as the big ones. So we set out to build the
            best sock we could possibly make. Then we made it again, twenty times over,
            until it felt like nothing on your foot.
          </p>
        </div>
      </section>

      {/* ---------------- Image band ---------------- */}
      <section className="container mx-auto pb-16 md:pb-24">
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-3xl ring-1 ring-foreground/5">
          <Image
            src="https://images.unsplash.com/photo-1631180543602-727e1197619d?w=2000&h=900&fit=crop&crop=entropy&auto=format&q=80"
            alt="Folded Knitto socks in a clean studio shot"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
        </div>
      </section>

      {/* ---------------- Pillars ---------------- */}
      <section className="bg-secondary">
        <div className="container mx-auto py-16 md:py-24">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
            {[
              {
                title: 'Combed cotton.',
                body: 'We start with long-staple combed cotton spun to a finer gauge. Softer next to skin, holds its shape wash after wash.',
              },
              {
                title: 'Engineered fit.',
                body: 'Y-stitched heel, seamless toe, honeycomb arch — every zone is built for the job it does, not stamped out flat.',
              },
              {
                title: 'Tested honestly.',
                body: 'If a batch can\'t survive 50 wash cycles without pilling or stretching, it doesn\'t ship. Simple as that.',
              },
            ].map((pillar) => (
              <div key={pillar.title}>
                <h3 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-base text-foreground/70 leading-relaxed">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Values copy ---------------- */}
      <section className="container mx-auto py-16 md:py-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 md:items-center">
          <div className="relative aspect-square overflow-hidden rounded-3xl ring-1 ring-foreground/5">
            <Image
              src="https://images.unsplash.com/photo-1564379976409-79bd0786fff1?w=900&h=900&fit=crop&crop=entropy&auto=format&q=80"
              alt="Close-up of premium sock knit"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              What we believe
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground md:text-4xl">
              Comfort isn&apos;t a luxury.
            </h2>
            <div className="mt-5 space-y-4 text-base text-foreground/70 leading-relaxed">
              <p>
                Most socks are made down to a price. We make ours up to a feeling — the
                quiet relief of slipping into something that just fits.
              </p>
              <p>
                That means no scratchy seams. No drooping at the ankle by 4pm. No mystery
                blends that pill after the third wash. Just honest materials, careful
                construction, and the kind of detail you only notice when it&apos;s missing.
              </p>
              <p>
                We&apos;re a small team based out of India, shipping pan-India and growing
                one drawer at a time. Thanks for being here.
              </p>
            </div>
            <div className="mt-8">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link href="/products">Shop the range</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
