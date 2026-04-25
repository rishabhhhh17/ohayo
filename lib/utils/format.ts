/**
 * Format an integer paise value as an INR price string.
 * e.g. 99900 → "₹999", 129900 → "₹1,299"
 */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}
