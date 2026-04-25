import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminClient } from '@/lib/supabase/admin';
import { sendOrderConfirmation, sendAdminNewOrderAlert } from '@/lib/email/send';

type RazorpayWebhookPayment = {
  entity: {
    id: string;
    order_id: string;
    status?: string;
  };
};

type RazorpayWebhookOrder = {
  entity: {
    id: string;
    receipt: string; // order_number
    status?: string;
  };
};

type RazorpayWebhookEvent = {
  event: string;
  payload: {
    payment?: { entity: RazorpayWebhookPayment['entity'] };
    order?: { entity: RazorpayWebhookOrder['entity'] };
  };
};

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // Return 200 to prevent Razorpay from retrying — log the issue
    console.warn('[WEBHOOK] RAZORPAY_WEBHOOK_SECRET not set — skipping verification');
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Use raw body for HMAC verification
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature') ?? '';

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  let isValid: boolean;
  try {
    isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex'),
    );
  } catch {
    isValid = false;
  }

  if (!isValid) {
    console.warn('[WEBHOOK] Invalid Razorpay webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  console.log(`[WEBHOOK] Received event: ${event.event}`);

  try {
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment?.entity;
        if (!payment) break;

        // Find order by razorpay_order_id
        const { data: order } = await adminClient
          .from('orders')
          .select('*')
          .eq('razorpay_order_id', payment.order_id)
          .single();

        if (!order) {
          console.warn(`[WEBHOOK] Order not found for razorpay_order_id: ${payment.order_id}`);
          break;
        }

        // Idempotent
        if (order.status === 'paid' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
          break;
        }

        await adminClient
          .from('orders')
          .update({ status: 'paid', razorpay_payment_id: payment.id })
          .eq('id', order.id);

        await adminClient.rpc('decrement_stock_for_order', { p_order_id: order.id });

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
        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment?.entity;
        if (!payment) break;

        const { data: order } = await adminClient
          .from('orders')
          .select('id, status')
          .eq('razorpay_order_id', payment.order_id)
          .single();

        if (!order) break;

        // Only cancel if still pending
        if (order.status === 'pending') {
          await adminClient
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', order.id);
        }
        break;
      }

      case 'order.paid': {
        const orderEntity = event.payload.order?.entity;
        if (!orderEntity) break;

        const { data: order } = await adminClient
          .from('orders')
          .select('*')
          .eq('razorpay_order_id', orderEntity.id)
          .single();

        if (!order) break;

        // Idempotent
        if (order.status === 'paid' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
          break;
        }

        await adminClient
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', order.id);

        await adminClient.rpc('decrement_stock_for_order', { p_order_id: order.id });

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
        break;
      }

      default:
        // Unknown event — return 200 quickly
        break;
    }
  } catch (err) {
    console.error('[WEBHOOK] Error processing event:', err);
    // Return 200 anyway — do not let Razorpay retry on processing errors
  }

  return NextResponse.json({ ok: true });
}
