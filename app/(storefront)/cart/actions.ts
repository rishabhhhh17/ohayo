'use server';

import { createClient } from '@/lib/supabase/server';

export type DiscountResult =
  | { ok: true; discount: { code: string; type: 'percentage' | 'fixed'; value: number; amount: number; discountCodeId: string } }
  | { ok: false; error: string };

/**
 * Validates a discount code against the DB and returns the computed discount.
 * All validation is server-side — never trust the client.
 */
export async function applyDiscountCode(
  code: string,
  subtotal: number,
): Promise<DiscountResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('active', true)
    .single();

  if (error || !data) {
    return { ok: false, error: 'Invalid or expired discount code.' };
  }

  // Date validation
  const now = new Date();
  const validFrom = new Date(data.valid_from);
  if (now < validFrom) {
    return { ok: false, error: 'This discount code is not yet active.' };
  }
  if (data.valid_until) {
    const validUntil = new Date(data.valid_until);
    if (now > validUntil) {
      return { ok: false, error: 'This discount code has expired.' };
    }
  }

  // Max uses
  if (data.max_uses !== null && data.uses_count >= data.max_uses) {
    return { ok: false, error: 'This discount code has reached its usage limit.' };
  }

  // Minimum order amount
  if (subtotal < data.min_order_amount) {
    const minFormatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(data.min_order_amount / 100);
    return {
      ok: false,
      error: `Minimum order of ${minFormatted} required for this code.`,
    };
  }

  // Compute discount amount
  let amount: number;
  if (data.type === 'percentage') {
    amount = Math.round((subtotal * data.value) / 100);
  } else {
    // fixed
    amount = Math.min(data.value, subtotal);
  }

  return {
    ok: true,
    discount: {
      code: data.code,
      type: data.type,
      value: data.value,
      amount,
      discountCodeId: data.id,
    },
  };
}
