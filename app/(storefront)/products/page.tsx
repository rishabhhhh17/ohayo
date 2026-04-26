import type { Metadata } from 'next';
import { ProductCard, type ProductCardData } from '@/components/storefront/product-card';
import { PRODUCTS } from '@/lib/products/data';

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'BlendStart breakfast drink mix — 23g protein, 11g fibre, electrolytes. Salted caramel cocoa, ready in 20 seconds.',
};

function toCard(p: (typeof PRODUCTS)[number]): ProductCardData {
  const primary = p.images.find((i) => i.is_primary) ?? p.images[0] ?? null;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    base_price: p.base_price,
    compare_at_price: p.compare_at_price,
    primary_image: primary ? { url: primary.url, alt_text: primary.alt_text } : null,
    variants: [],
  };
}

export default function ProductsPage() {
  const products = PRODUCTS.map(toCard);

  return (
    <div className="container mx-auto pt-24 pb-16">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
          Shop BlendStart
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          A complete breakfast in 20 seconds. Pick your blend.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ))}
      </div>
    </div>
  );
}
