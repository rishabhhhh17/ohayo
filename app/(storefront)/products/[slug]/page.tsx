import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
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
import { PRODUCTS, getProductBySlug, getRelatedProducts } from '@/lib/products/data';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found' };

  const primary = product.images.find((i) => i.is_primary) ?? product.images[0];

  return {
    title: product.name,
    description: `${product.name} — ${formatINR(product.base_price)}`,
    openGraph: {
      title: product.name,
      description: `${product.name} — ${formatINR(product.base_price)}`,
      images: primary ? [{ url: primary.url, alt: primary.alt_text }] : [],
    },
  };
}

function toCard(p: ReturnType<typeof getRelatedProducts>[number]): ProductCardData {
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

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const related = getRelatedProducts(product.id).map(toCard);

  return (
    <div className="container mx-auto pt-24 pb-16">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Shop</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ProductDetails product={product} />

      {related.length > 0 && (
        <section className="mt-16" aria-label="You might also like">
          <Separator className="mb-10" />
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => (
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
