/**
 * Testimonials — 3-up review cards.
 */

'use client';

import { motion, type Variants } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';

const REVIEWS = [
  {
    quote:
      "I used to skip breakfast or grab a sad oat bar. Now I genuinely look forward to mornings. It tastes like dessert, but I'm full till lunch.",
    name: 'Aanya R.',
    role: 'Product designer, Bengaluru',
    photo:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&auto=format&q=80',
  },
  {
    quote:
      "The Performance blend is genuinely the best-tasting thing with creatine in it. Mixes clean, no chalkiness, and it actually hits 23g of protein.",
    name: 'Karan M.',
    role: 'Crossfit coach, Mumbai',
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format&q=80',
  },
  {
    quote:
      "Salted caramel cocoa was a wild idea on paper. In the glass, it's the only thing that gets my 5-year-old excited about a healthy breakfast.",
    name: 'Priya S.',
    role: 'Mum of two, Pune',
    photo:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format&q=80',
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function Testimonials() {
  return (
    <section aria-label="Customer reviews" className="bg-rose/40 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sun">
            From the kitchen counter
          </p>
          <h2 className="font-display text-cocoa text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-tight">
            8,000+ better mornings.
          </h2>
        </div>

        <motion.div
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {REVIEWS.map((r) => (
            <motion.figure
              key={r.name}
              variants={itemVariants}
              className="relative flex flex-col rounded-3xl bg-cream-light p-7 ring-1 ring-cocoa/10"
            >
              {/* Decorative quote mark */}
              <div
                aria-hidden="true"
                className="absolute -top-4 left-7 flex h-10 w-10 items-center justify-center rounded-full bg-cocoa font-display text-2xl text-cream"
              >
                &ldquo;
              </div>

              <div className="mt-2 flex items-center gap-1" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="fill-sun text-sun" />
                ))}
              </div>

              <blockquote className="mt-4 flex-1 text-base leading-relaxed text-cocoa/85">
                {r.quote}
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-cocoa/10 pt-5">
                <span className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-sun/30">
                  <Image src={r.photo} alt="" fill sizes="40px" className="object-cover" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-cocoa">{r.name}</div>
                  <div className="text-xs text-cocoa/60">{r.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
