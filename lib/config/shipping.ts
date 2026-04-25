/**
 * Shipping configuration (all values in paise).
 */
export const SHIPPING_CONFIG = {
  /** Flat shipping rate in paise (₹49) */
  flatRate: 4900,
  /** Free shipping threshold in paise (₹999) */
  freeThreshold: 99900,
} as const;

/**
 * Calculate shipping amount based on subtotal.
 * Returns 0 if subtotal meets the free threshold, else flatRate.
 */
export function calculateShipping(subtotalPaise: number): number {
  return subtotalPaise >= SHIPPING_CONFIG.freeThreshold ? 0 : SHIPPING_CONFIG.flatRate;
}
