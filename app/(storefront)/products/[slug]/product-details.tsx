'use client';

import { useState, useCallback, useEffect } from 'react';
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
import { track } from '@/lib/analytics/fbq';
import type { StaticProduct, StaticImage, StaticVariant } from '@/lib/products/data';

function ImageGallery({ images, productName }: { images: StaticImage[]; productName: string }) {
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

export function ProductDetails({ product }: { product: StaticProduct }) {
  const router = useRouter();
  const cartAdd = useCartStore((state) => state.add);

  const variants = product.variants;
  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);

  const selectedVariant: StaticVariant | undefined = variants.find(
    (v) => v.id === selectedVariantId,
  );

  const maxQty = selectedVariant && selectedVariant.stock_quantity > 0
    ? Math.min(selectedVariant.stock_quantity, 10)
    : 10;

  const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0];

  // Fire ViewContent once per product page load
  useEffect(() => {
    track('ViewContent', {
      content_type: 'product',
      content_ids: [product.id],
      content_name: product.name,
      content_category: product.category,
      value: product.base_price,
      currency: 'INR',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select a pack size.');
      return;
    }

    const lineValue = (selectedVariant.price_override ?? product.base_price) * quantity;

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

    track('AddToCart', {
      content_type: 'product',
      content_ids: [selectedVariant.id],
      content_name: product.name,
      value: lineValue,
      currency: 'INR',
      contents: [{ id: selectedVariant.id, quantity }],
    });

    toast.success(`${product.name} added to cart`, {
      description: selectedVariant.size,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const effectivePrice = selectedVariant?.price_override ?? product.base_price;

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      <ImageGallery images={product.images} productName={product.name} />

      <div className="space-y-6">
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
              {Math.round(
                ((product.compare_at_price - effectivePrice) / product.compare_at_price) * 100,
              )}
              % off
            </span>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        )}

        {variants.length > 1 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Pack:</span>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Select pack size">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  aria-pressed={selectedVariantId === v.id}
                  className={cn(
                    'px-4 h-10 rounded-md border text-sm font-medium transition-all',
                    selectedVariantId === v.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-foreground hover:border-foreground/40',
                  )}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>
        )}

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

        <Accordion type="single" collapsible className="pt-4">
          {product.description && (
            <AccordionItem value="description">
              <AccordionTrigger className="text-sm font-medium">Description</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="how-to">
            <AccordionTrigger className="text-sm font-medium">How To Drink</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">
                Tear one sachet into 250&nbsp;ml of cold water or milk. Shake or whisk for 20
                seconds. Drink immediately. No blender, no mess.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shipping">
            <AccordionTrigger className="text-sm font-medium">Shipping &amp; Returns</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">
                Free shipping on orders above ₹999, otherwise a flat ₹49 across India. Dispatched
                within 1 business day. Unopened pouches can be returned within 7 days of delivery.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
