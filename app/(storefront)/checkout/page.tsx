'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronRight, Package, MapPin, CreditCard, Check, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { useCartStore } from '@/lib/cart/store';
import { formatINR } from '@/lib/utils/format';
import { loadRazorpayScript, openCheckout } from '@/lib/razorpay/checkout-client';
import { track } from '@/lib/analytics/fbq';

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------
const contactSchema = z.object({
  email: z.string().email('Enter a valid email'),
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .regex(/^[+0-9\s\-()]{10,15}$/, 'Enter a valid phone number'),
});

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .regex(/^[+0-9\s\-()]{10,15}$/, 'Enter a valid phone number'),
  line1: z.string().min(5, 'Address line 1 required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Enter a 6-digit pincode'),
  country: z.string().min(2),
});

type ContactFields = z.infer<typeof contactSchema>;
type AddressFields = z.infer<typeof addressSchema>;

// ---------------------------------------------------------------------------
// Step indicators
// ---------------------------------------------------------------------------
type Step = 'contact' | 'address' | 'review';

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'contact', label: 'Contact', icon: <Package className="h-4 w-4" /> },
  { id: 'address', label: 'Shipping', icon: <MapPin className="h-4 w-4" /> },
  { id: 'review', label: 'Review & Pay', icon: <CreditCard className="h-4 w-4" /> },
];

// ---------------------------------------------------------------------------
// Main CheckoutPage component
// ---------------------------------------------------------------------------
export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shipping, total, appliedDiscount, clear } = useCartStore();

  const [activeStep, setActiveStep] = useState<Step>('contact');
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [isPaying, setIsPaying] = useState(false);

  // Stored contact + address from step submissions
  const [contactData, setContactData] = useState<ContactFields | null>(null);
  const [addressData, setAddressData] = useState<AddressFields | null>(null);

  const sub = subtotal();
  const ship = shipping();
  const tot = total();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart');
    }
  }, [items, router]);

  // Fire InitiateCheckout once when the page loads with items
  useEffect(() => {
    if (items.length === 0) return;
    track('InitiateCheckout', {
      value: tot,
      currency: 'INR',
      num_items: items.reduce((n, i) => n + i.quantity, 0),
      content_ids: items.map((i) => i.variantId),
      contents: items.map((i) => ({ id: i.variantId, quantity: i.quantity })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Contact form
  const contactForm = useForm<ContactFields>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
  });

  // Address form
  const addressForm = useForm<AddressFields>({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
    defaultValues: { country: 'IN' },
  });

  function markCompleted(step: Step) {
    setCompletedSteps((prev) => new Set([...prev, step]));
  }

  function handleContactSubmit(data: ContactFields) {
    setContactData(data);
    markCompleted('contact');
    setActiveStep('address');
  }

  function handleAddressSubmit(data: AddressFields) {
    setAddressData(data);
    markCompleted('address');
    setActiveStep('review');
  }

  const handlePay = useCallback(async () => {
    if (!contactData || !addressData) return;
    if (items.length === 0) return;

    setIsPaying(true);

    try {
      // Load Razorpay script
      await loadRazorpayScript();
    } catch {
      toast.error('Could not load payment module. Check your internet connection.');
      setIsPaying(false);
      return;
    }

    // Call create-order API
    let createOrderRes: Response;
    try {
      createOrderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          contact: contactData,
          address: addressData,
          discountCode: appliedDiscount?.code,
        }),
      });
    } catch {
      toast.error('Network error. Please try again.');
      setIsPaying(false);
      return;
    }

    if (!createOrderRes.ok) {
      const errData = (await createOrderRes.json()) as { error?: string };
      toast.error(errData.error ?? 'Failed to create order');
      setIsPaying(false);
      return;
    }

    const orderData = (await createOrderRes.json()) as {
      orderNumber: string;
      orderId: string;
      razorpayOrderId: string;
      amount: number;
      currency: string;
      name: string;
      prefill: { name: string; email: string; contact: string };
    };

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      toast.error('Payment not configured. Contact support.');
      setIsPaying(false);
      return;
    }

    // Open Razorpay modal
    try {
      const payload = await openCheckout({
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.name,
        description: `Order ${orderData.orderNumber}`,
        order_id: orderData.razorpayOrderId,
        prefill: orderData.prefill,
        theme: { color: '#1a1a1a' },
      });

      // Same event_id used by client Pixel + server CAPI — Meta dedupes
      const eventId = `purchase_${payload.razorpay_payment_id}`;
      const numItems = items.reduce((n, i) => n + i.quantity, 0);
      const contentIds = items.map((i) => i.variantId);

      // Verify payment (server also fires CAPI Purchase with same event_id)
      const verifyRes = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderData.orderNumber,
          razorpay_order_id: payload.razorpay_order_id,
          razorpay_payment_id: payload.razorpay_payment_id,
          razorpay_signature: payload.razorpay_signature,
          event_id: eventId,
          email: contactData?.email,
          phone: contactData?.phone,
          value: tot,
          content_ids: contentIds,
          num_items: numItems,
        }),
      });

      if (!verifyRes.ok) {
        toast.error('Payment verification failed. Contact support.');
        setIsPaying(false);
        return;
      }

      const verifyData = (await verifyRes.json()) as { ok: boolean; redirectTo: string };

      // Stash purchase payload for the thank-you page Pixel fire (eventID lets
      // Meta dedupe with the CAPI fire). Keyed on orderNumber, which is in the
      // success URL.
      try {
        sessionStorage.setItem(
          `oh_purchase_${orderData.orderNumber}`,
          JSON.stringify({
            event_id: eventId,
            value: tot,
            currency: 'INR',
            num_items: numItems,
            content_ids: contentIds,
            contents: items.map((i) => ({ id: i.variantId, quantity: i.quantity })),
            order_id: orderData.orderNumber,
          }),
        );
      } catch {}

      // Success — clear cart and redirect (Purchase pixel fires on the success page)
      clear();
      toast.success('Payment successful! Redirecting…');
      router.push(verifyData.redirectTo);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      if (message === 'Payment cancelled by user') {
        toast.info('Payment cancelled');
      } else {
        toast.error(message);
      }
      setIsPaying(false);
    }
  }, [contactData, addressData, items, appliedDiscount, clear, router, tot]);

  if (items.length === 0) {
    return null; // Will redirect
  }

  const paymentsConfigured = Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">Checkout</h1>

        {!paymentsConfigured && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
            Online payments aren&apos;t live yet — we&apos;ll switch them on shortly. Browsing and
            cart still work; please check back soon to complete checkout.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: accordion steps */}
          <div className="lg:col-span-2">
            {/* Step progress indicator */}
            <div className="flex items-center mb-6 text-sm">
              {STEPS.map((step, idx) => {
                const isDone = completedSteps.has(step.id);
                const isActive = activeStep === step.id;
                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => {
                        // Allow going back to completed steps
                        if (isDone || isActive) setActiveStep(step.id);
                      }}
                      className={`flex items-center gap-1.5 font-medium transition-colors ${
                        isActive
                          ? 'text-foreground'
                          : isDone
                          ? 'text-primary hover:text-primary/80'
                          : 'text-muted-foreground cursor-default'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs border ${
                          isDone
                            ? 'bg-primary text-primary-foreground border-primary'
                            : isActive
                            ? 'border-foreground text-foreground'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        {isDone ? <Check className="h-3 w-3" /> : idx + 1}
                      </span>
                      <span className="hidden sm:inline">{step.label}</span>
                    </button>
                    {idx < STEPS.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
                    )}
                  </div>
                );
              })}
            </div>

            <Accordion
              type="single"
              value={activeStep}
              onValueChange={(v) => {
                if (v) setActiveStep(v as Step);
              }}
              collapsible={false}
              className="space-y-4"
            >
              {/* Step 1: Contact */}
              <AccordionItem value="contact" className="border border-border rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-4 hover:no-underline">
                  <div className="flex items-center gap-2 font-semibold">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>Contact Information</span>
                    {completedSteps.has('contact') && contactData && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {contactData.email}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <form
                    onSubmit={contactForm.handleSubmit(handleContactSubmit)}
                    className="space-y-4"
                    noValidate
                  >
                    <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={!!contactForm.formState.errors.email}
                        {...contactForm.register('email')}
                      />
                      {contactForm.formState.errors.email && (
                        <p role="alert" className="text-sm text-destructive">
                          {contactForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        aria-invalid={!!contactForm.formState.errors.phone}
                        {...contactForm.register('phone')}
                      />
                      {contactForm.formState.errors.phone && (
                        <p role="alert" className="text-sm text-destructive">
                          {contactForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" className="w-full sm:w-auto">
                      Continue to Shipping
                    </Button>
                  </form>
                </AccordionContent>
              </AccordionItem>

              {/* Step 2: Shipping Address */}
              <AccordionItem value="address" className="border border-border rounded-lg overflow-hidden">
                <AccordionTrigger
                  className="px-4 py-4 hover:no-underline"
                  disabled={!completedSteps.has('contact')}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Shipping Address</span>
                    {completedSteps.has('address') && addressData && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {addressData.city}, {addressData.state}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <form
                    onSubmit={addressForm.handleSubmit(handleAddressSubmit)}
                    className="space-y-4"
                    noValidate
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          autoComplete="name"
                          placeholder="Rishabh Kapadia"
                          aria-invalid={!!addressForm.formState.errors.fullName}
                          {...addressForm.register('fullName')}
                        />
                        {addressForm.formState.errors.fullName && (
                          <p role="alert" className="text-sm text-destructive">
                            {addressForm.formState.errors.fullName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="addr-phone">Phone</Label>
                        <Input
                          id="addr-phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+91 98765 43210"
                          aria-invalid={!!addressForm.formState.errors.phone}
                          {...addressForm.register('phone')}
                        />
                        {addressForm.formState.errors.phone && (
                          <p role="alert" className="text-sm text-destructive">
                            {addressForm.formState.errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="line1">Address Line 1</Label>
                        <Input
                          id="line1"
                          autoComplete="address-line1"
                          placeholder="House no., Street, Area"
                          aria-invalid={!!addressForm.formState.errors.line1}
                          {...addressForm.register('line1')}
                        />
                        {addressForm.formState.errors.line1 && (
                          <p role="alert" className="text-sm text-destructive">
                            {addressForm.formState.errors.line1.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="line2">
                          Address Line 2{' '}
                          <span className="text-xs text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                          id="line2"
                          autoComplete="address-line2"
                          placeholder="Landmark, Apartment no."
                          {...addressForm.register('line2')}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          autoComplete="address-level2"
                          placeholder="Bengaluru"
                          aria-invalid={!!addressForm.formState.errors.city}
                          {...addressForm.register('city')}
                        />
                        {addressForm.formState.errors.city && (
                          <p role="alert" className="text-sm text-destructive">
                            {addressForm.formState.errors.city.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          autoComplete="address-level1"
                          placeholder="Karnataka"
                          aria-invalid={!!addressForm.formState.errors.state}
                          {...addressForm.register('state')}
                        />
                        {addressForm.formState.errors.state && (
                          <p role="alert" className="text-sm text-destructive">
                            {addressForm.formState.errors.state.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          autoComplete="postal-code"
                          placeholder="560001"
                          maxLength={6}
                          aria-invalid={!!addressForm.formState.errors.pincode}
                          {...addressForm.register('pincode')}
                        />
                        {addressForm.formState.errors.pincode && (
                          <p role="alert" className="text-sm text-destructive">
                            {addressForm.formState.errors.pincode.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value="India"
                          readOnly
                          className="bg-muted text-muted-foreground cursor-not-allowed"
                        />
                        <input type="hidden" {...addressForm.register('country')} value="IN" />
                      </div>
                    </div>

                    <Button type="submit" className="w-full sm:w-auto">
                      Continue to Review
                    </Button>
                  </form>
                </AccordionContent>
              </AccordionItem>

              {/* Step 3: Review & Pay */}
              <AccordionItem value="review" className="border border-border rounded-lg overflow-hidden">
                <AccordionTrigger
                  className="px-4 py-4 hover:no-underline"
                  disabled={!completedSteps.has('address')}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Review &amp; Pay</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-6">
                    {/* Confirm contact + address */}
                    {contactData && (
                      <div className="text-sm space-y-1">
                        <p className="font-medium">Contact</p>
                        <p className="text-muted-foreground">{contactData.email}</p>
                        <p className="text-muted-foreground">{contactData.phone}</p>
                      </div>
                    )}

                    {addressData && (
                      <div className="text-sm space-y-1">
                        <p className="font-medium">Shipping to</p>
                        <p className="text-muted-foreground">
                          {addressData.fullName}
                          <br />
                          {addressData.line1}
                          {addressData.line2 && `, ${addressData.line2}`}
                          <br />
                          {addressData.city}, {addressData.state} – {addressData.pincode}
                          <br />
                          India
                        </p>
                      </div>
                    )}

                    <Separator />

                    {/* Order lines */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.variantId} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.productName}{' '}
                            <span className="text-xs">
                              ({item.size} / {item.colorName}) ×{item.quantity}
                            </span>
                          </span>
                          <span className="font-medium">{formatINR(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatINR(sub)}</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>Discount ({appliedDiscount.code})</span>
                          <span>-{formatINR(appliedDiscount.amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span>
                        <span>{ship === 0 ? 'FREE' : formatINR(ship)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-foreground text-base">
                        <span>Total</span>
                        <span>{formatINR(tot)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handlePay}
                      disabled={isPaying || !contactData || !addressData || !paymentsConfigured}
                      size="lg"
                      className="w-full"
                    >
                      {isPaying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing…
                        </>
                      ) : !paymentsConfigured ? (
                        <>Payments coming soon</>
                      ) : (
                        <>Pay {formatINR(tot)}</>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Secured by Razorpay. Your payment info is never stored on our servers.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Right: mini order summary (sticky on desktop) */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 sticky top-28">
              <h2 className="font-semibold text-foreground">Order Summary</h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.variantId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground line-clamp-1 max-w-[60%]">
                      {item.productName}{' '}
                      <span className="text-xs">×{item.quantity}</span>
                    </span>
                    <span>{formatINR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatINR(sub)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 text-xs">
                    <span>Discount</span>
                    <span>-{formatINR(appliedDiscount.amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{ship === 0 ? 'FREE' : formatINR(ship)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatINR(tot)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                <Link href="/cart" className="underline underline-offset-2 hover:text-foreground">
                  Edit cart
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
