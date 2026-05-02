'use server';

export type DiscountResult =
  | {
      ok: true;
      discount: {
        code: string;
        type: 'percentage' | 'fixed';
        value: number;
        amount: number;
        discountCodeId: string;
      };
    }
  | { ok: false; error: string };

const STATIC_CODES: Record<
  string,
  { type: 'percentage' | 'fixed'; value: number; minOrder: number }
> = {
  WELCOME10: { type: 'percentage', value: 10, minOrder: 0 },
  WELCOME15: { type: 'percentage', value: 15, minOrder: 0 },
  TESTORDER100: { type: 'percentage', value: 100, minOrder: 0 },
  BLEND200: { type: 'fixed', value: 20000, minOrder: 99900 },
};

export async function applyDiscountCode(
  code: string,
  subtotal: number,
): Promise<DiscountResult> {
  const trimmed = code.trim().toUpperCase();
  const def = STATIC_CODES[trimmed];

  if (!def) {
    return { ok: false, error: 'Invalid or expired discount code.' };
  }

  if (subtotal < def.minOrder) {
    const minFormatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(def.minOrder / 100);
    return { ok: false, error: `Minimum order of ${minFormatted} required for this code.` };
  }

  const amount =
    def.type === 'percentage'
      ? Math.round((subtotal * def.value) / 100)
      : Math.min(def.value, subtotal);

  return {
    ok: true,
    discount: {
      code: trimmed,
      type: def.type,
      value: def.value,
      amount,
      discountCodeId: trimmed,
    },
  };
}
