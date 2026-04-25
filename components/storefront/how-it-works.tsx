/**
 * How it works — 3 simple steps with sun-disc step numbers.
 */

const STEPS = [
  {
    n: '01',
    title: 'Scoop',
    body: 'One generous scoop straight from the pouch. About 28 grams of breakfast.',
  },
  {
    n: '02',
    title: 'Shake',
    body: '300 ml of cold water, oat or whole milk. Shake for 10 seconds in a bottle.',
  },
  {
    n: '03',
    title: 'Sip',
    body: 'Smooth, not chalky. Salted caramel cocoa goodness. Out the door.',
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how"
      aria-label="How it works"
      className="relative overflow-hidden bg-cream-light py-20 md:py-28"
    >
      {/* Diagonal sun decorations */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-12 h-72 w-72 rounded-full bg-rose/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-12 h-72 w-72 rounded-full bg-sun/15 blur-3xl"
      />

      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sun">
            Three steps
          </p>
          <h2 className="font-display text-cocoa text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-tight">
            Faster than the kettle.
          </h2>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {/* Connecting dotted line on desktop */}
          <div
            aria-hidden="true"
            className="absolute left-[16%] right-[16%] top-[44px] hidden border-t-2 border-dashed border-cocoa/15 md:block"
          />

          {STEPS.map((s) => (
            <div key={s.n} className="relative z-10 flex flex-col items-center text-center">
              {/* Sun-disc step circle */}
              <div className="relative mb-6 flex h-22 w-22">
                <div className="blendstart-sun flex h-22 w-22 items-center justify-center" style={{ width: 88, height: 88 }}>
                  <span className="font-display text-2xl text-cream">{s.n}</span>
                </div>
              </div>
              <h3 className="font-display text-3xl text-cocoa tracking-tight">{s.title}</h3>
              <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-cocoa/65">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
