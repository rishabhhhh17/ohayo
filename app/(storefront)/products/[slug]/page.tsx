import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ProductDetails } from './product-details';
import { ProductCard, type ProductCardData } from '@/components/storefront/product-card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { formatINR } from '@/lib/utils/format';
import type { ProductVariant } from '@/types/database';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type FullProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  base_price: number;
  compare_at_price: number | null;
  category: string | null;
  gender: string;
  featured: boolean;
  created_at: string;
  images: { id: string; url: string; alt_text: string; sort_order: number; is_primary: boolean }[];
  variants: ProductVariant[];
};

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
async function getProduct(slug: string): Promise<FullProduct | null> {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error || !product) return null;

  const [{ data: images }, { data: variants }] = await Promise.all([
    supabase
      .from('product_images')
      .select('id, url, alt_text, sort_order, is_primary')
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id)
      .order('size', { ascending: true }),
  ]);

  return {
    ...product,
    images: images ?? [],
    variants: variants ?? [],
  };
}

async function getRelatedProducts(
  category: string | null,
  currentId: string,
): Promise<ProductCardData[]> {
  if (!category) return [];
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name, base_price, compare_at_price')
    .eq('status', 'active')
    .eq('category', category)
    .neq('id', currentId)
    .limit(8);

  if (!products || products.length === 0) return [];

  // Randomly pick up to 4
  const shuffled = [...products].sort(() => Math.random() - 0.5).slice(0, 4);
  const ids = shuffled.map((p) => p.id);

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

  const imageMap = new Map<string, { url: string; alt_text: string }>();
  images?.forEach((img) => imageMap.set(img.product_id, { url: img.url, alt_text: img.alt_text }));

  const colourMap = new Map<string, { id: string; color_hex: string; color_name: string }[]>();
  variants?.forEach((v) => {
    const existing = colourMap.get(v.product_id) ?? [];
    if (!existing.some((e) => e.color_hex === v.color_hex)) {
      colourMap.set(v.product_id, [...existing, { id: v.id, color_hex: v.color_hex, color_name: v.color_name }]);
    }
  });

  return shuffled.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    base_price: p.base_price,
    compare_at_price: p.compare_at_price,
    primary_image: imageMap.get(p.id) ?? null,
    variants: colourMap.get(p.id) ?? [],
  }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product Not Found' };

  const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0];

  return {
    title: product.name,
    description: `${product.name} — ${product.category ?? 'Premium Socks'} — ${formatINR(product.base_price)}`,
    openGraph: {
      title: product.name,
      description: `${product.name} — ${product.category ?? 'Premium Socks'} — ${formatINR(product.base_price)}`,
      images: primaryImage ? [{ url: primaryImage.url, alt: primaryImage.alt_text }] : [],
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.category, product.id);

  return (
    <div className="container mx-auto pt-24 pb-16">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          {product.category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                >
                  {product.category}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Product details (client component for interactivity) */}
      <ProductDetails product={product} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16" aria-label="You might also like">
          <Separator className="mb-10" />
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
