/**
 * FAQ — accordion of common questions.
 *
 * Uses Radix Accordion via shadcn primitives if available; falls back to
 * native <details> for zero-dep robustness.
 */

const FAQS = [
  {
    q: 'Can BlendStart actually replace breakfast?',
    a: 'Yes — every serving has 23g of complete protein, 11g of prebiotic fibre, healthy fats, electrolytes and 180 kcal. That covers what a balanced breakfast should give you, in one glass.',
  },
  {
    q: 'How does it taste?',
    a: 'Like a proper salted caramel cocoa: deep, slightly salty, just sweet enough. We use Dutch-process cocoa, real sea salt, and caramelised coconut sugar — no artificial sweeteners.',
  },
  {
    q: 'What\'s the difference between Balanced and Performance?',
    a: 'They share the same flavour and base nutrition. Performance adds 3g of creatine monohydrate per serving for training mornings. Pick Balanced if you don\'t train, or alternate between the two.',
  },
  {
    q: 'When should I drink it?',
    a: 'First thing in the morning, on the way out, mid-morning if you\'ve had an early gym session — anywhere a quick, complete breakfast helps. Most people use it 4–5 mornings a week.',
  },
  {
    q: 'Is it suitable for kids?',
    a: 'A half-scoop is a great post-school snack for kids 5+. We don\'t recommend it as their main daily breakfast unless you\'ve checked with a paediatrician.',
  },
  {
    q: 'How long does one pouch last?',
    a: 'Balanced (55g) is a 2-day starter pack. Performance (85g) is a 3-day pack. We also offer a 30-serve subscription that ships fresh every month.',
  },
] as const;

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="bg-cream py-20 md:py-28"
    >
      <div className="container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Heading column */}
          <div className="lg:col-span-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sun">
              The fine print
            </p>
            <h2 className="font-display text-cocoa text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-tight">
              Questions, <span className="font-editorial text-cocoa/70">answered.</span>
            </h2>
            <p className="mt-5 max-w-sm text-base text-cocoa/65 leading-relaxed">
              Still curious? Drop us a note at{' '}
              <a
                href="mailto:hello@blendstart.com"
                className="text-cocoa underline underline-offset-4 hover:text-sun"
              >
                hello@blendstart.com
              </a>
              .
            </p>
          </div>

          {/* Accordion column */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl bg-cream-light ring-1 ring-cocoa/10">
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  className="group border-b border-cocoa/10 last:border-b-0"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-6 py-5 text-left font-display text-lg text-cocoa transition-colors hover:bg-rose/20 sm:px-8 sm:text-xl">
                    {f.q}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-1.5 h-4 w-4 shrink-0 rotate-0 text-sun transition-transform group-open:rotate-45"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 pr-16 text-base leading-relaxed text-cocoa/70 sm:px-8">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
