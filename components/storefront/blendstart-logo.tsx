import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  /** Stack the sun above the wordmark (vertical lockup). */
  stacked?: boolean;
  /** Show the sun disc element. */
  withSun?: boolean;
  /** Force a light wordmark color (for use over dark backgrounds). */
  light?: boolean;
};

/**
 * BlendStart wordmark. The chunky display look comes from `font-display`
 * (Bagel Fat One). When `withSun` is on, a red sun-disc is layered above.
 */
export function BlendStartLogo({ className, stacked, withSun = true, light }: Props) {
  if (stacked) {
    return (
      <span
        className={cn('inline-flex flex-col items-center leading-none', className)}
        aria-label="BlendStart"
      >
        {withSun && (
          <span
            aria-hidden="true"
            className="blendstart-sun mb-1 h-3 w-3 sm:h-4 sm:w-4"
          />
        )}
        <span
          className={cn(
            'font-display tracking-tight',
            light ? 'text-cream' : 'text-cocoa',
          )}
        >
          BlendStart
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn('inline-flex items-center gap-2 leading-none', className)}
      aria-label="BlendStart"
    >
      {withSun && (
        <span
          aria-hidden="true"
          className="blendstart-sun h-3 w-3 sm:h-3.5 sm:w-3.5"
        />
      )}
      <span
        className={cn(
          'font-display tracking-tight',
          light ? 'text-cream' : 'text-cocoa',
        )}
      >
        BlendStart
      </span>
    </span>
  );
}
