import Image from 'next/image';
import Link from 'next/link';
import { formatINR } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  base_price: number;
  compare_at_price?: number | null;
  primary_image: { url: string; alt_text: string } | null;
  variants: { id: string; color_hex: string; color_name: string }[];
};

type ProductCardProps = {
  product: ProductCardData;
  className?: string;
  sizes?: string;
};

export function ProductCard({ product, className, sizes }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        'group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl',
        className,
      )}
      aria-label={`${product.name} — ${formatINR(product.base_price)}`}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted transition-shadow duration-300 group-hover:shadow-lift group-hover:border group-hover:border-primary/30">
        {product.primary_image ? (
          <Image
            src={product.primary_image.url}
            alt={product.primary_image.alt_text || product.name}
            fill
            loading="lazy"
            sizes={sizes ?? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="mt-3 px-1">
        <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground tabular-nums">
            {formatINR(product.base_price)}
          </p>
          {product.compare_at_price && product.compare_at_price > product.base_price && (
            <p className="text-xs text-muted-foreground line-through tabular-nums">
              {formatINR(product.compare_at_price)}
            </p>
          )}
        </div>

        {/* Colour swatches */}
        {product.variants.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1" aria-label="Available colours">
            {product.variants.slice(0, 6).map((v) => (
              <span
                key={v.id}
                title={v.color_name}
                aria-label={v.color_name}
                className="h-3.5 w-3.5 rounded-full border border-border"
                style={{ backgroundColor: v.color_hex }}
              />
            ))}
            {product.variants.length > 6 && (
              <span className="text-xs text-muted-foreground leading-4">
                +{product.variants.length - 6}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
