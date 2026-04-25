/**
 * Featured Products — "Bestsellers" section
 *
 * Server component. Queries Supabase for products where featured=true AND status='active'.
 * If 0 rows are returned, renders nothing (null).
 */

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Product, ProductImage, ProductVariant } from '@/types/database';
import { ProductCard, type ProductCardData } from '@/components/storefront/product-card';

type FeaturedProduct = Product & {
  primary_image: Pick<ProductImage, 'url' | 'alt_text'> | null;
  variants: Pick<ProductVariant, 'id' | 'color_hex' | 'color_name'>[];
};

function toCardData(p: FeaturedProduct): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    base_price: p.base_price,
    compare_at_price: p.compare_at_price,
    primary_image: p.primary_image,
    variants: p.variants,
  };
}

async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .eq('status', 'active')
    .order('sort_order', { ascending: true })
    .limit(8);

  if (error || !products || products.length === 0) return [];

  // Fetch primary images and unique colours per product
  const ids = products.map((p) => p.id);

  const [{ data: images }, { data: variants }] = await Promise.all([
    supabase
      .from('product_images')
      .select('product_id, url, alt_text')
      .in('product_id', ids)
      .eq('is_primary', true),
    supabase
      .from('product_variants')
      .select('id, product_id, color_hex, color_name')
      .in('product_id', ids),
  ]);

  const imageMap = new Map<string, Pick<ProductImage, 'url' | 'alt_text'>>();
  images?.forEach((img) => imageMap.set(img.product_id, { url: img.url, alt_text: img.alt_text }));

  // Deduplicate colours per product
  const colourMap = new Map<string, Pick<ProductVariant, 'id' | 'color_hex' | 'color_name'>[]>();
  variants?.forEach((v) => {
    const existing = colourMap.get(v.product_id) ?? [];
    const alreadyHasColour = existing.some((e) => e.color_hex === v.color_hex);
    if (!alreadyHasColour) {
      colourMap.set(v.product_id, [...existing, { id: v.id, color_hex: v.color_hex, color_name: v.color_name }]);
    }
  });

  return products.map((p) => ({
    ...p,
    primary_image: imageMap.get(p.id) ?? null,
    variants: colourMap.get(p.id) ?? [],
  }));
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  // If no featured products yet — hide section entirely
  if (products.length === 0) return null;

  return (
    <section aria-label="Bestsellers" className="container mx-auto py-12 md:py-20">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
          Bestsellers
        </h2>
        <Link
          href="/products"
          className="text-sm font-medium text-foreground/60 hover:text-foreground underline underline-offset-4 transition-colors shrink-0"
        >
          View all
        </Link>
      </div>

      {/* Mobile: horizontal scroll. Desktop: 4-col grid */}
      <div
        className="
          flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4
          md:grid md:grid-cols-4 md:overflow-visible md:snap-none md:pb-0
          -mx-4 px-4 md:mx-0 md:px-0
        "
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[72vw] sm:w-[48vw] shrink-0 snap-center md:w-auto"
          >
            <ProductCard
              product={toCardData(product)}
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
