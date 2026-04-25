import { Suspense } from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ProductCard, type ProductCardData } from '@/components/storefront/product-card';
import { PlpFilters, PlpSidebar } from '@/components/storefront/plp-filters';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const category = searchParams.category as string | undefined;
  const sort = searchParams.sort as string | undefined;

  let title = 'Shop All Socks';
  if (category) title = `${category} Socks`;
  if (sort === 'newest') title += ' — New Arrivals';

  return {
    title,
    description:
      'Browse Knitto\'s full range of premium socks — bamboo, cotton, compression, diabetic care, and more.',
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseMulti(val: string | string[] | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return val.split(',').filter(Boolean);
}

type SearchParams = { [key: string]: string | string[] | undefined };

async function getProducts(searchParams: SearchParams) {
  const supabase = await createClient();

  const categories = parseMulti(searchParams.category);
  const gender = searchParams.gender as string | undefined;
  const sizes = parseMulti(searchParams.size);
  const colors = parseMulti(searchParams.color);
  const priceMin = searchParams.priceMin ? Number(searchParams.priceMin) : undefined;
  const priceMax = searchParams.priceMax ? Number(searchParams.priceMax) : undefined;
  const sort = (searchParams.sort as string) || 'featured';

  let query = supabase
    .from('products')
    .select('id, slug, name, base_price, compare_at_price, category, gender, featured, sort_order, created_at')
    .eq('status', 'active');

  // Category filter
  if (categories.length > 0) {
    query = query.in('category', categories);
  }

  // Gender filter
  if (gender && gender !== '') {
    query = query.eq('gender', gender as 'mens' | 'womens' | 'unisex' | 'kids');
  }

  // Price range
  if (priceMin !== undefined) {
    query = query.gte('base_price', priceMin);
  }
  if (priceMax !== undefined) {
    query = query.lte('base_price', priceMax);
  }

  // Sort
  switch (sort) {
    case 'price-asc':
      query = query.order('base_price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('base_price', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    default:
      // featured: featured DESC, sort_order ASC, created_at DESC
      query = query
        .order('featured', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      break;
  }

  const { data: products, error } = await query;

  if (error || !products || products.length === 0) return [];

  // Get all product IDs after text filtering
  const ids = products.map((p) => p.id);

  // Fetch images and variants
  const [{ data: images }, { data: variants }] = await Promise.all([
    supabase
      .from('product_images')
      .select('product_id, url, alt_text')
      .in('product_id', ids)
      .eq('is_primary', true),
    supabase
      .from('product_variants')
      .select('id, product_id, color_hex, color_name, size, stock_quantity')
      .in('product_id', ids),
  ]);

  // Filter by size if specified
  let filteredIds = new Set(ids);
  if (sizes.length > 0) {
    const productsWithSize = new Set(
      (variants ?? []).filter((v) => sizes.includes(v.size)).map((v) => v.product_id),
    );
    filteredIds = new Set([...filteredIds].filter((id) => productsWithSize.has(id)));
  }

  // Filter by color if specified
  if (colors.length > 0) {
    const productsWithColor = new Set(
      (variants ?? []).filter((v) => colors.includes(v.color_name)).map((v) => v.product_id),
    );
    filteredIds = new Set([...filteredIds].filter((id) => productsWithColor.has(id)));
  }

  // Build image map
  const imageMap = new Map<string, { url: string; alt_text: string }>();
  images?.forEach((img) => imageMap.set(img.product_id, { url: img.url, alt_text: img.alt_text }));

  // Build deduplicated color swatch map per product
  const colourMap = new Map<string, { id: string; color_hex: string; color_name: string }[]>();
  variants?.forEach((v) => {
    const existing = colourMap.get(v.product_id) ?? [];
    const alreadyHasColour = existing.some((e) => e.color_hex === v.color_hex);
    if (!alreadyHasColour) {
      colourMap.set(v.product_id, [
        ...existing,
        { id: v.id, color_hex: v.color_hex, color_name: v.color_name },
      ]);
    }
  });

  return products
    .filter((p) => filteredIds.has(p.id))
    .map<ProductCardData>((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      base_price: p.base_price,
      compare_at_price: p.compare_at_price,
      primary_image: imageMap.get(p.id) ?? null,
      variants: colourMap.get(p.id) ?? [],
    }));
}

async function getFilterOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('product_variants')
    .select('color_name')
    .not('color_name', 'is', null);

  const unique = [...new Set((data ?? []).map((v) => v.color_name))].sort();
  return unique;
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="animate-pulse bg-muted rounded-xl aspect-square" />
          <div className="animate-pulse bg-muted rounded h-4 w-3/4" />
          <div className="animate-pulse bg-muted rounded h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Products Grid (async inner component)
// ---------------------------------------------------------------------------
async function ProductsGrid({ searchParams }: { searchParams: SearchParams }) {
  const products = await getProducts(searchParams);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground text-lg mb-4">No products match your filters.</p>
        <Link
          href="/products"
          className="text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const availableColors = await getFilterOptions();

  return (
    <div className="container mx-auto pt-24 pb-16">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
          Shop All Socks
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Premium bamboo, cotton, compression &amp; speciality socks — crafted for comfort.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <PlpSidebar availableColors={availableColors} searchParams={searchParams} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort bar + mobile filter trigger */}
          <PlpFilters availableColors={availableColors} searchParams={searchParams} />

          {/* Grid */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductsGrid searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
