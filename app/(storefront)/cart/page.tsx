'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/cart/store';
import { formatINR } from '@/lib/utils/format';
import { applyDiscountCode } from './actions';

export default function CartPage() {
  const { items, subtotal, shipping, total, appliedDiscount, remove, setQty, setDiscount, clearDiscount } =
    useCartStore();

  const [discountCode, setDiscountCode] = useState('');
  const [isPending, startTransition] = useTransition();

  const sub = subtotal();
  const ship = shipping();
  const tot = total();

  function handleRemove(variantId: string) {
    remove(variantId);
    toast.success('Item removed from cart');
  }

  function handleQty(variantId: string, qty: number) {
    if (qty < 1) return;
    setQty(variantId, qty);
  }

  function handleApplyDiscount() {
    if (!discountCode.trim()) return;
    startTransition(async () => {
      const result = await applyDiscountCode(discountCode, sub);
      if (result.ok) {
        setDiscount({
          code: result.discount.code,
          type: result.discount.type,
          value: result.discount.value,
          amount: result.discount.amount,
        });
        setDiscountCode('');
        toast.success(`Discount "${result.discount.code}" applied!`);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleRemoveDiscount() {
    clearDiscount();
    toast.info('Discount removed');
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/40 mb-6" />
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Looks like you haven&apos;t added anything yet. Pick a blend and start your morning right.
        </p>
        <Button asChild size="lg">
          <Link href="/products">Shop Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">Your Cart</h1>

        <div className="mb-6 rounded-lg bg-green-50 dark:bg-green-950/30 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          Free shipping on every order across India.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Line items */}
          <div className="lg:col-span-2 space-y-0">
            {items.map((item, idx) => (
              <div key={item.variantId}>
                {idx > 0 && <Separator className="my-4" />}
                <div className="flex gap-4 py-4">
                  {/* Image */}
                  <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col gap-2 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="font-medium text-foreground hover:underline line-clamp-2 text-sm sm:text-base"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          {item.size} / {item.colorName}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.variantId)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 flex-shrink-0"
                        aria-label={`Remove ${item.productName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      {/* Qty stepper */}
                      <div className="flex items-center border border-border rounded-md">
                        <button
                          onClick={() => handleQty(item.variantId, item.quantity - 1)}
                          className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQty(item.variantId, item.quantity + 1)}
                          className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Line total */}
                      <span className="font-semibold text-foreground text-sm sm:text-base">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4 sticky top-28">
              <h2 className="font-semibold text-foreground text-lg">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">{formatINR(sub)}</span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>-{formatINR(appliedDiscount.amount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className={ship === 0 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-foreground font-medium'}>
                    {ship === 0 ? 'FREE' : formatINR(ship)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-foreground text-base">
                  <span>Total</span>
                  <span>{formatINR(tot)}</span>
                </div>
              </div>

              {/* Discount code input */}
              <div className="pt-2">
                {appliedDiscount ? (
                  <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {appliedDiscount.code}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveDiscount}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Remove discount"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                      className="flex-1 text-sm h-9"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyDiscount}
                      disabled={isPending || !discountCode.trim()}
                      className="h-9"
                    >
                      {isPending ? 'Applying…' : 'Apply'}
                    </Button>
                  </div>
                )}
              </div>

              <Button asChild size="lg" className="w-full">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Taxes calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
