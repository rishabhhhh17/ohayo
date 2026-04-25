/**
 * Why OHAYO — 4-up benefits grid.
 *
 * Replaces the legacy "comfort callouts" with morning-fuel benefits.
 */

'use client';

import { motion, type Variants } from 'framer-motion';
import { Sunrise, Dumbbell, Sprout, Clock } from 'lucide-react';

const FEATURES = [
  {
    Icon: Sunrise,
    title: 'A full breakfast',
    description: 'Protein, fibre, fats and electrolytes — what your body actually wants at 7am.',
  },
  {
    Icon: Dumbbell,
    title: '23g of real protein',
    description: 'Complete amino profile from a milk + plant blend. Builds, repairs, satisfies.',
  },
  {
    Icon: Sprout,
    title: '11g prebiotic fibre',
    description: 'Slow-release energy and a happy gut, without the 11am crash.',
  },
  {
    Icon: Clock,
    title: 'Ready in 20 seconds',
    description: 'One scoop, water or milk, shake. Faster than the kettle.',
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function ComfortCallouts() {
  return (
    <section aria-label="Why OHAYO" className="relative bg-rose/40">
      <div className="container py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sun">
            Why OHAYO
          </p>
          <h2 className="font-display text-cocoa text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-tight">
            Breakfast, <span className="font-editorial text-cocoa/70">re-engineered.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-cocoa/70 leading-relaxed">
            We replaced the cereal aisle with one well-thought scoop. No shortcuts, no
            sugar-bombs, no excuses to skip the most important meal.
          </p>
        </div>

        <motion.div
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {FEATURES.map(({ Icon, title, description }) => (
            <motion.div
              key={title}
              variants={itemVariants}
              className="rounded-3xl bg-cream-light p-7 ring-1 ring-cocoa/10 transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-cocoa text-cream">
                <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl text-cocoa tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cocoa/65">
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
