import { NextResponse } from 'next/server';
import crypto from 'crypto';

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

  return NextResponse.json({
    ok: true,
    redirectTo: `/orders/${orderNumber}/success`,
  });
}
