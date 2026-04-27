import type { MetadataRoute } from 'next';
import { PRODUCTS } from '@/lib/products/data';

const BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://blendstart.in';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    '',
    '/products',
    '/about',
    '/cart',
    '/contact',
    '/track',
    '/shipping',
    '/refunds',
    '/privacy',
    '/terms',
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '' ? 1 : path === '/products' ? 0.9 : 0.5,
    })),
    ...PRODUCTS.map((p) => ({
      url: `${BASE}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
