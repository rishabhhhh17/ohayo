/**
 * Marquee strip — scrolling brand claims.
 * Runs continuously; pauses on hover for accessibility.
 */
const ITEMS = [
  '23g Protein',
  '11g Fibre',
  '3g Creatine',
  'Electrolytes',
  'No added sugar',
  'Real cocoa',
  'Salted caramel',
  '20-second breakfast',
] as const;

export function MarqueeStrip() {
  // Render items twice so the loop is seamless.
  const loop = [...ITEMS, ...ITEMS];

  return (
    <section aria-label="Product highlights" className="relative isolate overflow-hidden border-y border-cocoa/15 bg-cocoa py-5 text-cream">
      <div
        className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap will-change-transform [animation-play-state:running] hover:[animation-play-state:paused]"
        aria-hidden="true"
      >
        {loop.map((item, i) => (
          <div key={`${item}-${i}`} className="flex items-center gap-10">
            <span className="font-display text-2xl tracking-tight text-cream md:text-3xl">
              {item}
            </span>
            <span aria-hidden="true" className="ohayo-sun h-3 w-3 shrink-0" />
          </div>
        ))}
      </div>
      {/* Screen-reader equivalent */}
      <span className="sr-only">{ITEMS.join(', ')}</span>
    </section>
  );
}
