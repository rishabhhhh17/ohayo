'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatINR } from '@/lib/utils/format';
import { useCartStore } from '@/lib/cart/store';
import { cn } from '@/lib/utils';
import type { ProductVariant } from '@/types/database';

type ProductImage = {
  id: string;
  url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
};

type FullProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  base_price: number;
  compare_at_price: number | null;
  category: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
};

// Derive distinct colors and sizes from variants
function getDistinctColors(variants: ProductVariant[]) {
  const seen = new Set<string>();
  return variants.filter((v) => {
    if (seen.has(v.color_hex)) return false;
    seen.add(v.color_hex);
    return true;
  });
}

function getDistinctSizes(variants: ProductVariant[]) {
  const seen = new Set<string>();
  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  return variants
    .filter((v) => {
      if (seen.has(v.size)) return false;
      seen.add(v.size);
      return true;
    })
    .sort((a, b) => {
      const ai = SIZE_ORDER.indexOf(a.size);
      const bi = SIZE_ORDER.indexOf(b.size);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
}

// ---------------------------------------------------------------------------
// Image Gallery
// ---------------------------------------------------------------------------
function ImageGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback(
    (idx: number) => setActiveIndex((idx + images.length) % images.length),
    [images.length],
  );

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center">
        <span className="text-muted-foreground">No image</span>
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3">
      {/* Thumbnail strip — hidden on mobile, vertical on desktop */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[500px] shrink-0">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1}`}
              className={cn(
                'shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                activeIndex === idx ? 'border-primary' : 'border-transparent hover:border-border',
              )}
            >
              <Image
                src={img.url}
                alt={img.alt_text || productName}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
          <Image
            src={active.url}
            alt={active.alt_text || productName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>

        {/* Mobile swipe arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo(activeIndex - 1)}
              className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full h-8 w-8 flex items-center justify-center shadow-soft"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => goTo(activeIndex + 1)}
              className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full h-8 w-8 flex items-center justify-center shadow-soft"
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>
            {/* Dot indicators (mobile) */}
            <div className="md:hidden absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to image ${idx + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    idx === activeIndex ? 'w-4 bg-primary' : 'w-1.5 bg-background/60',
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Size Guide table
// ---------------------------------------------------------------------------
function SizeGuideTable() {
  return (
    <div className="overflow-x-auto">
      <p className="text-xs text-muted-foreground mb-3">[ADMIN: verify] — Standard reference sizes</p>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-3 py-2 font-medium border border-border">Size</th>
            <th className="text-left px-3 py-2 font-medium border border-border">UK Shoe</th>
            <th className="text-left px-3 py-2 font-medium border border-border">EU Shoe</th>
            <th className="text-left px-3 py-2 font-medium border border-border">Foot Length (cm)</th>
          </tr>
        </thead>
        <tbody>
          {[
            { size: 'S', uk: '3–5', eu: '35–38', cm: '21–23' },
            { size: 'M', uk: '5–7', eu: '38–41', cm: '23–26' },
            { size: 'L', uk: '7–9', eu: '41–44', cm: '26–28' },
            { size: 'XL', uk: '9–12', eu: '44–47', cm: '28–31' },
          ].map((row) => (
            <tr key={row.size} className="even:bg-muted/20">
              <td className="px-3 py-2 font-medium border border-border">{row.size}</td>
              <td className="px-3 py-2 border border-border">{row.uk}</td>
              <td className="px-3 py-2 border border-border">{row.eu}</td>
              <td className="px-3 py-2 border border-border">{row.cm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ProductDetails client component
// ---------------------------------------------------------------------------
export function ProductDetails({ product }: { product: FullProduct }) {
  const router = useRouter();
  const cartAdd = useCartStore((state) => state.add);

  const distinctColors = getDistinctColors(product.variants);
  const distinctSizes = getDistinctSizes(product.variants);

  const [selectedColor, setSelectedColor] = useState<string>(
    distinctColors[0]?.color_hex ?? '',
  );
  const [selectedSize, setSelectedSize] = useState<string>(distinctSizes[0]?.size ?? '');
  const [quantity, setQuantity] = useState(1);

  // Find the exact variant matching selected color + size
  const selectedVariant = product.variants.find(
    (v) => v.color_hex === selectedColor && v.size === selectedSize,
  );

  // Check if a given size is available for the selected color
  const isSizeAvailable = (size: string) =>
    product.variants.some((v) => v.color_hex === selectedColor && v.size === size);

  // Check if a given color has any variant
  const isColorAvailable = (hex: string) =>
    product.variants.some((v) => v.color_hex === hex);

  // TODO: enforce stock cap once admin sets real stock in Phase 8
  const maxQty = selectedVariant && selectedVariant.stock_quantity > 0
    ? selectedVariant.stock_quantity
    : 10; // allow up to 10 while stock_quantity = 0 (placeholder)

  const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0];

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select a size and color.');
      return;
    }

    cartAdd({
      variantId: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      image: primaryImage?.url ?? '',
      price: selectedVariant.price_override ?? product.base_price,
      size: selectedVariant.size,
      colorName: selectedVariant.color_name,
      quantity,
    });

    toast.success(`${product.name} added to cart`, {
      description: `Size ${selectedVariant.size} · ${selectedVariant.color_name}`,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // TODO Phase 6: wire to real checkout flow
    router.push('/checkout');
  };

  const effectivePrice = selectedVariant?.price_override ?? product.base_price;

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      {/* Left: Image Gallery */}
      <ImageGallery images={product.images} productName={product.name} />

      {/* Right: Product Info */}
      <div className="space-y-6">
        {/* Name */}
        <div>
          {product.category && (
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              {product.category}
            </p>
          )}
          <h1 className="font-serif text-3xl font-semibold text-foreground leading-tight">
            {product.name}
          </h1>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="font-bold text-2xl text-foreground tabular-nums">
            {formatINR(effectivePrice)}
          </span>
          {product.compare_at_price && product.compare_at_price > effectivePrice && (
            <span className="text-base text-muted-foreground line-through tabular-nums">
              {formatINR(product.compare_at_price)}
            </span>
          )}
          {product.compare_at_price && product.compare_at_price > effectivePrice && (
            <span className="text-xs font-semibold text-success">
              {Math.round(((product.compare_at_price - effectivePrice) / product.compare_at_price) * 100)}% off
            </span>
          )}
        </div>

        {/* Short description */}
        {product.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        )}

        {/* Color selector */}
        {distinctColors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-foreground">Colour:</span>
              <span className="text-sm text-muted-foreground">
                {distinctColors.find((v) => v.color_hex === selectedColor)?.color_name}
              </span>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Select colour">
              {distinctColors.map((v) => {
                const available = isColorAvailable(v.color_hex);
                return (
                  <button
                    key={v.color_hex}
                    onClick={() => available && setSelectedColor(v.color_hex)}
                    disabled={!available}
                    aria-label={v.color_name}
                    aria-pressed={selectedColor === v.color_hex}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-all',
                      selectedColor === v.color_hex
                        ? 'border-primary ring-2 ring-primary/30 scale-110'
                        : 'border-border hover:border-foreground/30',
                      !available && 'opacity-40 cursor-not-allowed',
                    )}
                    style={{ backgroundColor: v.color_hex }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Size selector */}
        {distinctSizes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Size:</span>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Select size">
              {distinctSizes.map((v) => {
                const available = isSizeAvailable(v.size);
                return (
                  <button
                    key={v.size}
                    onClick={() => available && setSelectedSize(v.size)}
                    disabled={!available}
                    aria-label={`Size ${v.size}${!available ? ' (out of stock)' : ''}`}
                    aria-pressed={selectedSize === v.size}
                    className={cn(
                      'relative h-10 w-14 rounded-md border text-sm font-medium transition-all',
                      selectedSize === v.size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:border-foreground/40',
                      !available &&
                        'text-muted-foreground line-through opacity-50 cursor-not-allowed',
                    )}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity stepper */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">Quantity:</span>
          <div className="flex items-center gap-2 border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="h-10 w-10 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={16} aria-hidden="true" />
            </button>
            <span className="w-10 text-center text-sm font-medium tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
              aria-label="Increase quantity"
              className="h-10 w-10 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="flex-1 rounded-full gap-2 font-semibold"
            disabled={!selectedVariant}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            Add to Cart
          </Button>
          <Button
            onClick={handleBuyNow}
            size="lg"
            variant="outline"
            className="flex-1 rounded-full gap-2 font-semibold"
            disabled={!selectedVariant}
          >
            <Zap size={18} aria-hidden="true" />
            Buy Now
          </Button>
        </div>

        {/* Accordion — below the fold details */}
        <Accordion type="single" collapsible className="pt-4">
          {product.description && (
            <AccordionItem value="description">
              <AccordionTrigger className="text-sm font-medium">Description</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="materials">
            <AccordionTrigger className="text-sm font-medium">Materials &amp; Care</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">[ADMIN: fill in materials and care instructions]</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shipping">
            <AccordionTrigger className="text-sm font-medium">Shipping &amp; Returns</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">[ADMIN: fill in shipping and returns policy]</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="size-guide">
            <AccordionTrigger className="text-sm font-medium">Size Guide</AccordionTrigger>
            <AccordionContent>
              <SizeGuideTable />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
