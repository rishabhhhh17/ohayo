import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { adminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { calculateShipping } from '@/lib/config/shipping';

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

export async function POST(request: Request) {
  // Fail at request time with clear message if keys are missing
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!keySecret || !keyId) {
    return NextResponse.json(
      { error: 'Payments not configured. Set RAZORPAY_KEY_SECRET and NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local.' },
      { status: 503 },
    );
  }

  let body: CreateOrderRequestBody;
  try {
    body = await request.json() as CreateOrderRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { items, contact, address, discountCode } = body;

  // Validate inputs
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

  // ---- Server-side total recompute ----
  // Fetch all variants with their products to get authoritative prices
  const variantIds = items.map((i) => i.variantId);
  const { data: variants, error: variantsError } = await adminClient
    .from('product_variants')
    .select('id, price_override, product_id, products(base_price, name, status)')
    .in('id', variantIds);

  if (variantsError || !variants) {
    return NextResponse.json({ error: 'Failed to fetch product data' }, { status: 500 });
  }

  // Build a map for quick lookup
  const variantMap = new Map(
    variants.map((v) => [v.id, v]),
  );

  // Validate all variants found and products are active
  for (const item of items) {
    const variant = variantMap.get(item.variantId);
    if (!variant) {
      return NextResponse.json(
        { error: `Product variant ${item.variantId} not found` },
        { status: 400 },
      );
    }
    // Type assertion for nested select
    const product = variant.products as unknown as { base_price: number; name: string; status: string } | null;
    if (!product || product.status !== 'active') {
      return NextResponse.json(
        { error: `One or more items are no longer available` },
        { status: 400 },
      );
    }
  }

  // Compute subtotal
  let subtotal = 0;
  const lineItems: Array<{
    variantId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }> = [];

  for (const item of items) {
    const variant = variantMap.get(item.variantId)!;
    const product = variant.products as unknown as { base_price: number; name: string; status: string };
    const unitPrice = variant.price_override ?? product.base_price;
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;
    lineItems.push({
      variantId: item.variantId,
      name: product.name,
      unitPrice,
      quantity: item.quantity,
      lineTotal,
    });
  }

  // Re-validate and compute discount server-side
  let discountAmount = 0;
  let discountCodeId: string | null = null;
  if (discountCode) {
    const { data: dcData } = await adminClient
      .from('discount_codes')
      .select('*')
      .eq('code', discountCode.trim().toUpperCase())
      .eq('active', true)
      .single();

    if (dcData) {
      const now = new Date();
      const validFrom = new Date(dcData.valid_from);
      const isValidFrom = now >= validFrom;
      const isValidUntil = !dcData.valid_until || now <= new Date(dcData.valid_until);
      const withinMaxUses = dcData.max_uses === null || dcData.uses_count < dcData.max_uses;
      const meetsMinOrder = subtotal >= dcData.min_order_amount;

      if (isValidFrom && isValidUntil && withinMaxUses && meetsMinOrder) {
        if (dcData.type === 'percentage') {
          discountAmount = Math.round((subtotal * dcData.value) / 100);
        } else {
          discountAmount = Math.min(dcData.value, subtotal);
        }
        discountCodeId = dcData.id;
      }
    }
  }

  const shippingAmount = calculateShipping(subtotal);
  const totalAmount = subtotal - discountAmount + shippingAmount;

  // Get optional user from session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Build address snapshots
  const addressSnapshot = {
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? null,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country ?? 'IN',
  };

  // Insert pending order
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      email: contact.email,
      phone: contact.phone,
      subtotal,
      discount_amount: discountAmount,
      shipping_amount: shippingAmount,
      tax_amount: 0,
      total_amount: totalAmount,
      currency: 'INR',
      status: 'pending',
      shipping_address: addressSnapshot,
      billing_address: addressSnapshot,
      discount_code_id: discountCodeId,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Order insert error:', orderError);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }

  // Insert order items
  const orderItemsData = lineItems.map((li) => ({
    order_id: order.id,
    variant_id: li.variantId,
    product_name_snapshot: li.name,
    variant_snapshot: variantMap.get(li.variantId) ?? {},
    unit_price: li.unitPrice,
    quantity: li.quantity,
    line_total: li.lineTotal,
  }));

  const { error: itemsError } = await adminClient.from('order_items').insert(orderItemsData);
  if (itemsError) {
    console.error('Order items insert error:', itemsError);
    // Don't fail the whole flow — order was created
  }

  // Create Razorpay order
  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  let rzpOrder: { id: string };
  try {
    rzpOrder = (await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: order.order_number,
      payment_capture: true,
    })) as unknown as { id: string };
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    return NextResponse.json({ error: 'Failed to initiate payment. Please try again.' }, { status: 500 });
  }

  // Update order with Razorpay order ID
  await adminClient
    .from('orders')
    .update({ razorpay_order_id: rzpOrder.id })
    .eq('id', order.id);

  return NextResponse.json({
    orderNumber: order.order_number,
    orderId: order.id,
    razorpayOrderId: rzpOrder.id,
    amount: totalAmount,
    currency: 'INR',
    name: 'Knitto',
    prefill: {
      name: address.fullName,
      email: contact.email,
      contact: contact.phone,
    },
  });
}
