import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PurchaseTracker } from './purchase-tracker';

export const metadata: Metadata = {
  title: 'Order Confirmed',
};

type PageProps = {
  params: { orderNumber: string };
};

export default function OrderSuccessPage({ params }: PageProps) {
  const { orderNumber } = params;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <PurchaseTracker orderNumber={orderNumber} />
      <div className="max-w-xl mx-auto text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground mb-1">
          Order <span className="font-medium text-foreground">{orderNumber}</span>
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          We&apos;ve received your payment. A confirmation email is on its way and we&apos;ll
          dispatch your pouches within one business day.
        </p>

        <Button asChild size="lg">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
