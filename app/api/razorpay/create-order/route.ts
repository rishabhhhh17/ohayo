import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { calculateShipping } from '@/lib/config/shipping';
import { getVariantById } from '@/lib/products/data';

export type CreateOrderRequestBody = {
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  contact: {
    email: string;
    phone: string;
  };
  address: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  discountCode?: string;
};

const STATIC_CODES: Record<
  string,
  { type: 'percentage' | 'fixed'; value: number; minOrder: number }
> = {
  WELCOME10: { type: 'percentage', value: 10, minOrder: 0 },
  WELCOME15: { type: 'percentage', value: 15, minOrder: 0 },
  TESTORDER100: { type: 'percentage', value: 100, minOrder: 0 },
  BLEND200: { type: 'fixed', value: 20000, minOrder: 99900 },
};

const RAZORPAY_MIN_PAISE = 100;

function buildOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `BS-${ts}-${rand}`;
}

export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!keySecret || !keyId) {
    return NextResponse.json(
      {
        error:
          'Payments not configured. Set RAZORPAY_KEY_SECRET and NEXT_PUBLIC_RAZORPAY_KEY_ID in env.',
      },
      { status: 503 },
    );
  }

  let body: CreateOrderRequestBody;
  try {
    body = (await request.json()) as CreateOrderRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { items, contact, address, discountCode } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }
  if (!contact?.email || !contact?.phone) {
    return NextResponse.json({ error: 'Contact info required' }, { status: 400 });
  }
  if (!address?.line1 || !address?.city || !address?.state || !address?.pincode) {
    return NextResponse.json({ error: 'Shipping address required' }, { status: 400 });
  }
  if (!/^[0-9]{6}$/.test(address.pincode)) {
    return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 });
  }

  let subtotal = 0;
  for (const item of items) {
    const found = getVariantById(item.variantId);
    if (!found) {
      return NextResponse.json(
        { error: `Product variant ${item.variantId} not found` },
        { status: 400 },
      );
    }
    if (item.quantity < 1) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }
    const unitPrice = found.variant.price_override ?? found.product.base_price;
    subtotal += unitPrice * item.quantity;
  }

  let discountAmount = 0;
  if (discountCode) {
    const def = STATIC_CODES[discountCode.trim().toUpperCase()];
    if (def && subtotal >= def.minOrder) {
      discountAmount =
        def.type === 'percentage'
          ? Math.round((subtotal * def.value) / 100)
          : Math.min(def.value, subtotal);
    }
  }

  const shippingAmount = calculateShipping(subtotal);
  let totalAmount = subtotal - discountAmount + shippingAmount;
  if (totalAmount < RAZORPAY_MIN_PAISE) {
    discountAmount = Math.max(0, subtotal + shippingAmount - RAZORPAY_MIN_PAISE);
    totalAmount = subtotal - discountAmount + shippingAmount;
  }
  const orderNumber = buildOrderNumber();

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  let rzpOrder: { id: string };
  try {
    rzpOrder = (await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: orderNumber,
      payment_capture: true,
      notes: {
        orderNumber,
        email: contact.email,
        phone: contact.phone,
        shipTo: `${address.fullName}, ${address.line1}${
          address.line2 ? ', ' + address.line2 : ''
        }, ${address.city}, ${address.state} ${address.pincode}`,
      },
    })) as unknown as { id: string };
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    return NextResponse.json(
      { error: 'Failed to initiate payment. Please try again.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    orderNumber,
    orderId: orderNumber,
    razorpayOrderId: rzpOrder.id,
    amount: totalAmount,
    currency: 'INR',
    name: 'BlendStart',
    prefill: {
      name: address.fullName,
      email: contact.email,
      contact: contact.phone,
    },
  });
}
