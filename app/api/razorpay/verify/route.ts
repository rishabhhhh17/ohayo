import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminClient } from '@/lib/supabase/admin';
import { sendOrderConfirmation, sendAdminNewOrderAlert } from '@/lib/email/send';

type VerifyRequestBody = {
  orderNumber: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json(
      { error: 'Payments not configured. Set RAZORPAY_KEY_SECRET in .env.local.' },
      { status: 503 },
    );
  }

  let body: VerifyRequestBody;
  try {
    body = await request.json() as VerifyRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { orderNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!orderNumber || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // HMAC verification using timingSafeEqual
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  let isValid: boolean;
  try {
    isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpay_signature, 'hex'),
    );
  } catch {
    isValid = false;
  }

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  // Fetch order
  const { data: order, error: fetchError } = await adminClient
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Idempotent — if already paid, return success without re-processing
  if (order.status === 'paid' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
    return NextResponse.json({
      ok: true,
      redirectTo: `/orders/${orderNumber}/success`,
    });
  }

  // Update order to paid
  const { error: updateError } = await adminClient
    .from('orders')
    .update({
      status: 'paid',
      razorpay_payment_id,
      razorpay_signature,
      razorpay_order_id,
    })
    .eq('id', order.id);

  if (updateError) {
    console.error('Order update error:', updateError);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }

  // Decrement stock
  const { error: stockError } = await adminClient.rpc('decrement_stock_for_order', {
    p_order_id: order.id,
  });
  if (stockError) {
    console.error('Stock decrement error (non-fatal):', stockError);
  }

  // Fetch updated order for emails
  const { data: updatedOrder } = await adminClient
    .from('orders')
    .select('*')
    .eq('id', order.id)
    .single();

  if (updatedOrder) {
    await Promise.all([
      sendOrderConfirmation(updatedOrder),
      sendAdminNewOrderAlert(updatedOrder),
    ]);
  }

  return NextResponse.json({
    ok: true,
    redirectTo: `/orders/${orderNumber}/success`,
  });
}
