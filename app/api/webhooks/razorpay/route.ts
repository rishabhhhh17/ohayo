import { NextResponse } from 'next/server';
import crypto from 'crypto';

type RazorpayWebhookEvent = {
  event: string;
  payload: Record<string, unknown>;
};

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('[WEBHOOK] RAZORPAY_WEBHOOK_SECRET not set — skipping verification');
    return NextResponse.json({ ok: true }, { status: 200 });
  }

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

  console.log(`[WEBHOOK] ${event.event}`, JSON.stringify(event.payload).slice(0, 500));

  return NextResponse.json({ ok: true });
}
