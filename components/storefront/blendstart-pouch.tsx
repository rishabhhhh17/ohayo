import { cn } from '@/lib/utils';

type Variant = 'balanced' | 'performance';

type Props = {
  variant?: Variant;
  className?: string;
  /** Optional rotate (degrees) for layered hero compositions. */
  rotate?: number;
  /** Show the optional shadow at the base. */
  withShadow?: boolean;
};

/**
 * Pure-CSS rendering of the BlendStart breakfast pouch.
 *
 * Replicates the brand packaging: pink top half with red sun-disc + chunky
 * "BlendStart" wordmark, cream bottom half with the product label and stats.
 *
 * Designed to be used at any size — set width with className (e.g. w-64).
 */
export function BlendStartPouch({
  variant = 'balanced',
  className,
  rotate = 0,
  withShadow = true,
}: Props) {
  const isPerformance = variant === 'performance';

  return (
    <div
      className={cn('relative inline-block', className)}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      {/* The pouch itself — aspect ratio mirrors the real packaging */}
      <div
        className={cn(
          'relative aspect-[5/7] w-full overflow-hidden rounded-[14%/10%] rounded-t-[36%/22%]',
          'shadow-lift ring-1 ring-cocoa/5',
        )}
        aria-hidden="true"
      >
        {/* Zip seal at top — subtle horizontal line + dotted stitch */}
        <div className="absolute left-1/2 top-[3%] z-20 h-[2%] w-[36%] -translate-x-1/2 rounded-full bg-rose/60" />
        <div className="absolute left-1/2 top-[5.2%] z-20 h-[1px] w-[80%] -translate-x-1/2 border-t border-dashed border-cocoa/15" />

        {/* Top half — soft pink */}
        <div className="absolute inset-x-0 top-0 h-[52%] bg-rose">
          {/* Sun disc */}
          <div className="absolute left-1/2 top-[42%] h-[36%] w-[36%] -translate-x-1/2 rounded-full bg-sun shadow-sun" />
        </div>

        {/* Bottom half — cream */}
        <div className="absolute inset-x-0 bottom-0 h-[48%] bg-cream-light">
          {/* Wordmark — overlaps the seam between top + bottom */}
          <div
            className={cn(
              'absolute left-1/2 top-[-12%] -translate-x-1/2 font-display text-cocoa',
              'text-[clamp(1.2rem,4cqw,3rem)] leading-none tracking-tight',
            )}
            style={{ containerType: 'inline-size' }}
          >
            BlendStart
          </div>

          {/* Product label */}
          <div className="absolute inset-x-[10%] top-[28%] text-center">
            <div className="font-semibold uppercase tracking-tight text-cocoa text-[clamp(0.55rem,2.2cqw,1rem)] leading-tight">
              Salted Caramel Cocoa
            </div>
            <div className="mt-[3%] font-serif italic text-cocoa/80 text-[clamp(0.45rem,1.6cqw,0.8rem)]">
              Breakfast Drink Mix
            </div>
            <div className="mx-auto mt-[8%] h-px w-[60%] bg-cocoa/15" />
            <div className="mt-[6%] text-cocoa text-[clamp(0.4rem,1.45cqw,0.7rem)] leading-snug font-medium">
              {isPerformance ? (
                <>
                  23g Protein · 11g Fibre · 3g Creatine
                  <br />
                  Electrolytes
                </>
              ) : (
                <>
                  23g Protein · 11g Fibre
                  <br />
                  Electrolytes
                </>
              )}
            </div>
            <div
              className={cn(
                'mx-auto mt-[7%] inline-block rounded-full px-[6%] py-[2%] text-[clamp(0.4rem,1.5cqw,0.75rem)] font-bold uppercase tracking-wider',
                isPerformance ? 'bg-sun text-cream' : 'bg-cocoa text-cream',
              )}
            >
              {isPerformance ? 'Performance' : 'Balanced'}
            </div>
          </div>

          {/* Net weight */}
          <div className="absolute inset-x-0 bottom-[6%] text-center text-cocoa/60 text-[clamp(0.4rem,1.2cqw,0.65rem)]">
            NET WT. {isPerformance ? '85' : '55'} g
          </div>
        </div>

        {/* Subtle vertical highlight to suggest a glossy pouch */}
        <div className="pointer-events-none absolute inset-y-0 left-[8%] w-[3%] bg-gradient-to-r from-white/35 to-transparent" />
      </div>

      {/* Soft cast shadow */}
      {withShadow && (
        <div
          aria-hidden="true"
          className="absolute -bottom-3 left-1/2 -z-10 h-4 w-[80%] -translate-x-1/2 rounded-full bg-cocoa/15 blur-md"
        />
      )}
    </div>
  );
}
