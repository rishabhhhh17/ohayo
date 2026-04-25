import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle2, Package, MapPin, Clock } from 'lucide-react';

import { adminClient } from '@/lib/supabase/admin';
import { formatINR } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Json } from '@/types/database';

export const metadata: Metadata = {
  title: 'Order Confirmed',
};

type AddressSnapshot = {
  fullName?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  phone?: string;
};

function parseAddress(raw: Json): AddressSnapshot {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as AddressSnapshot;
  }
  return {};
}

type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

const STATUS_TIMELINE: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'paid', label: 'Payment Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_ORDER: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

function getStatusIndex(status: OrderStatus): number {
  return STATUS_ORDER.indexOf(status);
}

type PageProps = {
  params: { orderNumber: string };
  searchParams: { email?: string };
};

export default async function OrderSuccessPage({ params, searchParams }: PageProps) {
  const { orderNumber } = params;

  // Fetch order with items
  const { data: order, error } = await adminClient
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        product_name_snapshot,
        unit_price,
        quantity,
        line_total,
        variant_snapshot
      )
    `)
    .eq('order_number', orderNumber)
    .single();

  if (error || !order) {
    notFound();
  }

  // Guest email verification: if ?email= provided, it must match order email
  const guestEmail = searchParams.email;
  if (guestEmail && guestEmail.toLowerCase() !== order.email.toLowerCase()) {
    notFound();
  }

  const shippingAddress = parseAddress(order.shipping_address);
  const currentStatusIndex = getStatusIndex(order.status as OrderStatus);

  const isTerminal = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-10">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
            {isTerminal ? 'Order ' + order.status : 'Order Confirmed!'}
          </h1>
          <p className="text-muted-foreground">
            Order <span className="font-medium text-foreground">{order.order_number}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Confirmation sent to <span className="text-foreground">{order.email}</span>
          </p>
        </div>

        {/* Status timeline */}
        {!isTerminal && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Order Status
            </h2>
            <div className="flex items-start justify-between gap-1">
              {STATUS_TIMELINE.map((step, idx) => {
                const stepIdx = STATUS_ORDER.indexOf(step.key);
                const isDone = stepIdx <= currentStatusIndex;
                const isCurrent = stepIdx === currentStatusIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1 min-w-0">
                    {/* Connector line before */}
                    <div className="flex items-center w-full">
                      {idx > 0 && (
                        <div
                          className={`flex-1 h-0.5 ${
                            stepIdx <= currentStatusIndex ? 'bg-primary' : 'bg-border'
                          }`}
                        />
                      )}
                      <div
                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                          isDone
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-background border-border text-muted-foreground'
                        } ${isCurrent ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      {idx < STATUS_TIMELINE.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 ${
                            stepIdx < currentStatusIndex ? 'bg-primary' : 'bg-border'
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-center text-xs px-1 leading-tight ${
                        isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order items */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Items Ordered
          </h2>
          <div className="space-y-3">
            {(order.order_items as Array<{
              id: string;
              product_name_snapshot: string;
              unit_price: number;
              quantity: number;
              line_total: number;
              variant_snapshot: Json;
            }>).map((item) => {
              const snapshot = item.variant_snapshot as Record<string, unknown> | null;
              const size = snapshot?.size as string | undefined;
              const colorName = snapshot?.color_name as string | undefined;
              return (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.product_name_snapshot}</p>
                    {(size || colorName) && (
                      <p className="text-xs text-muted-foreground">
                        {[size, colorName].filter(Boolean).join(' / ')} × {item.quantity}
                      </p>
                    )}
                  </div>
                  <span className="font-medium shrink-0 ml-4">{formatINR(item.line_total)}</span>
                </div>
              );
            })}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount</span>
                <span>-{formatINR(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{order.shipping_amount === 0 ? 'FREE' : formatINR(order.shipping_amount)}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between font-semibold text-foreground text-base">
              <span>Total</span>
              <span>{formatINR(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        {shippingAddress.line1 && (
          <div className="rounded-xl border border-border bg-card p-6 mb-8">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </h2>
            <address className="text-sm text-muted-foreground not-italic space-y-0.5">
              {shippingAddress.fullName && <p className="text-foreground font-medium">{shippingAddress.fullName}</p>}
              <p>{shippingAddress.line1}</p>
              {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
              <p>
                {shippingAddress.city}, {shippingAddress.state} – {shippingAddress.pincode}
              </p>
              <p>India</p>
              {shippingAddress.phone && <p className="mt-1">{shippingAddress.phone}</p>}
            </address>
          </div>
        )}

        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
