/**
 * Nutrition card — what's in one serving (28g scoop).
 *
 * Two-column: nutrition stat grid + ingredient list, anchored to #nutrition.
 */

import Image from 'next/image';
import { Leaf } from 'lucide-react';

const NUTRITION = [
  { label: 'Energy', value: '180', unit: 'kcal' },
  { label: 'Protein', value: '23', unit: 'g' },
  { label: 'Fibre', value: '11', unit: 'g' },
  { label: 'Carbs', value: '12', unit: 'g' },
  { label: 'Sugar', value: '2', unit: 'g' },
  { label: 'Fat', value: '4', unit: 'g' },
] as const;

const INGREDIENTS = [
  'Whey protein isolate',
  'Oat fibre',
  'Dutch-process cocoa',
  'Caramelised coconut sugar',
  'Sea salt',
  'MCT oil powder',
  'Electrolyte blend',
  'Natural caramel flavour',
] as const;

export function NutritionCard() {
  return (
    <section
      id="nutrition"
      aria-label="What's inside"
      className="relative bg-cocoa py-20 text-cream md:py-28"
    >
      {/* Sun glow accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-1/4 h-72 w-72 rounded-full bg-sun/30 blur-3xl"
      />

      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sun">
            What&rsquo;s inside
          </p>
          <h2 className="font-display text-cream text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-tight">
            One scoop. <span className="font-editorial text-cream/70">A whole breakfast.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-cream/65 leading-relaxed">
            Per 28g serving in 300ml water. No artificial sweeteners. No fillers. Just the things you&rsquo;d want at 7am, in the right amounts.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Nutrition stat block */}
          <div className="rounded-3xl bg-cream-light/5 p-8 ring-1 ring-cream/10 backdrop-blur lg:col-span-5">
            <h3 className="font-display text-2xl text-cream">Nutrition facts</h3>
            <div className="mt-6 grid grid-cols-3 gap-y-6">
              {NUTRITION.map((n) => (
                <div key={n.label} className="border-l border-cream/15 pl-4 first:border-l-0 first:pl-0 [&:nth-child(4)]:border-l-0 [&:nth-child(4)]:pl-0">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl text-cream">{n.value}</span>
                    <span className="text-sm font-medium text-cream/60">{n.unit}</span>
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-cream/55">
                    {n.label}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-cream/55">
              Performance blend adds 3g creatine monohydrate to support training.
            </p>
          </div>

          {/* Ingredient list — paired with a still-life photo */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-7">
            <div className="relative aspect-square overflow-hidden rounded-3xl ring-1 ring-cream/10 sm:order-2">
              <Image
                src="https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=900&h=900&fit=crop&crop=entropy&auto=format&q=85"
                alt="Cocoa powder, sea salt and oats arranged on a warm surface"
                fill
                sizes="(max-width: 1024px) 50vw, 30vw"
                className="object-cover"
              />
            </div>
            <div className="rounded-3xl bg-cream-light/5 p-8 ring-1 ring-cream/10 backdrop-blur sm:order-1">
              <div className="mb-5 flex items-center gap-2">
                <Leaf size={16} className="text-sun" aria-hidden="true" />
                <h3 className="font-display text-2xl text-cream">Eight ingredients</h3>
              </div>
              <ul className="space-y-2.5 text-sm">
                {INGREDIENTS.map((ing, i) => (
                  <li
                    key={ing}
                    className="flex items-baseline gap-3 border-b border-cream/10 pb-2.5 last:border-b-0 last:pb-0"
                  >
                    <span className="font-display text-sm text-sun">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-cream/85">{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
