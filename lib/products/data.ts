/**
 * Static product catalog for BlendStart.
 *
 * All prices are in paise (smallest INR unit). 9900 = ₹99.
 * Mutate this file to add/edit products — no database round-trip.
 */

export type StaticVariant = {
  id: string;
  size: string;
  color_name: string;
  color_hex: string;
  sku: string;
  stock_quantity: number;
  price_override: number | null;
};

export type StaticImage = {
  id: string;
  url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
};

export type StaticProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  base_price: number;
  compare_at_price: number | null;
  category: string | null;
  featured: boolean;
  images: StaticImage[];
  variants: StaticVariant[];
};

const BRAND_HEX = '#3a2d24';

export const PRODUCTS: StaticProduct[] = [
  {
    id: 'p_blend_balanced',
    slug: 'blendstart-balanced-salted-caramel-cocoa',
    name: 'BlendStart Balanced — Salted Caramel Cocoa',
    description:
      'A complete breakfast in a glass. 23g of slow-release plant protein, 11g of prebiotic fibre, electrolytes, and 26 vitamins & minerals — whisked into salted caramel cocoa that\'s ready in 20 seconds.',
    base_price: 99900,
    compare_at_price: 119900,
    category: 'Balanced',
    featured: true,
    images: [
      {
        id: 'img_balanced_1',
        url: '/products/balanced.svg',
        alt_text: 'BlendStart Balanced salted caramel cocoa pouch',
        sort_order: 0,
        is_primary: true,
      },
      {
        id: 'img_balanced_2',
        url: '/products/balanced-2.svg',
        alt_text: 'A glass of BlendStart cocoa, ready in 20 seconds',
        sort_order: 1,
        is_primary: false,
      },
    ],
    variants: [
      {
        id: 'v_balanced_7',
        size: '7 Sachets',
        color_name: 'Salted Caramel Cocoa',
        color_hex: BRAND_HEX,
        sku: 'BS-BAL-7',
        stock_quantity: 250,
        price_override: null,
      },
      {
        id: 'v_balanced_14',
        size: '14 Sachets',
        color_name: 'Salted Caramel Cocoa',
        color_hex: BRAND_HEX,
        sku: 'BS-BAL-14',
        stock_quantity: 180,
        price_override: 179900,
      },
      {
        id: 'v_balanced_30',
        size: '30 Sachets',
        color_name: 'Salted Caramel Cocoa',
        color_hex: BRAND_HEX,
        sku: 'BS-BAL-30',
        stock_quantity: 120,
        price_override: 349900,
      },
    ],
  },
  {
    id: 'p_blend_performance',
    slug: 'blendstart-performance-salted-caramel-cocoa',
    name: 'BlendStart Performance — Salted Caramel Cocoa',
    description:
      'For training mornings. 32g of fast-and-slow protein, added creatine, BCAAs, electrolytes, and 11g of fibre — same 20-second prep, double the recovery.',
    base_price: 129900,
    compare_at_price: 149900,
    category: 'Performance',
    featured: true,
    images: [
      {
        id: 'img_perf_1',
        url: '/products/performance.svg',
        alt_text: 'BlendStart Performance salted caramel cocoa pouch',
        sort_order: 0,
        is_primary: true,
      },
      {
        id: 'img_perf_2',
        url: '/products/performance-2.svg',
        alt_text: 'BlendStart Performance shaker bottle',
        sort_order: 1,
        is_primary: false,
      },
    ],
    variants: [
      {
        id: 'v_perf_7',
        size: '7 Sachets',
        color_name: 'Salted Caramel Cocoa',
        color_hex: BRAND_HEX,
        sku: 'BS-PER-7',
        stock_quantity: 220,
        price_override: null,
      },
      {
        id: 'v_perf_14',
        size: '14 Sachets',
        color_name: 'Salted Caramel Cocoa',
        color_hex: BRAND_HEX,
        sku: 'BS-PER-14',
        stock_quantity: 160,
        price_override: 239900,
      },
      {
        id: 'v_perf_30',
        size: '30 Sachets',
        color_name: 'Salted Caramel Cocoa',
        color_hex: BRAND_HEX,
        sku: 'BS-PER-30',
        stock_quantity: 90,
        price_override: 459900,
      },
    ],
  },
];

export function getProductBySlug(slug: string): StaticProduct | null {
  return PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export function getProductById(id: string): StaticProduct | null {
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

export function getVariantById(
  variantId: string,
): { product: StaticProduct; variant: StaticVariant } | null {
  for (const product of PRODUCTS) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return null;
}

export function getRelatedProducts(currentId: string, limit = 4): StaticProduct[] {
  return PRODUCTS.filter((p) => p.id !== currentId).slice(0, limit);
}
