import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { fireCapiPurchase } from '@/lib/meta-capi';

type VerifyRequestBody = {
  orderNumber: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  event_id?: string;
  email?: string;
  phone?: string;
  value?: number; // rupees
  content_ids?: string[];
  num_items?: number;
};

export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json(
      { error: 'Payments not configured. Set RAZORPAY_KEY_SECRET in env.' },
      { status: 503 },
    );
  }

  let body: VerifyRequestBody;
  try {
    body = (await request.json()) as VerifyRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { orderNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!orderNumber || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

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

  console.log(
    `[ORDER] paid — ${orderNumber} (rzp_order=${razorpay_order_id}, payment=${razorpay_payment_id})`,
  );

  // Server-side CAPI Purchase. event_id matches the client Pixel call so Meta
  // dedupes them. No-ops if NEXT_PUBLIC_META_PIXEL_ID / META_ACCESS_TOKEN not set.
  if (typeof body.value === 'number' && Array.isArray(body.content_ids)) {
    fireCapiPurchase({
      event_id: body.event_id || `purchase_${razorpay_payment_id}`,
      email: body.email,
      phone: body.phone,
      value_inr: body.value,
      currency: 'INR',
      content_ids: body.content_ids,
      num_items: body.num_items ?? body.content_ids.length,
      client_ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      user_agent: request.headers.get('user-agent') ?? undefined,
      event_source_url: request.headers.get('referer') ?? undefined,
    }).catch((err) => console.error('[meta] CAPI fire failed', err));
  }

  return NextResponse.json({
    ok: true,
    redirectTo: `/orders/${orderNumber}/success`,
  });
}
