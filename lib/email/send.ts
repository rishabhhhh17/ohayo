// TODO: wire to Resend in Phase 9

import type { Tables } from '@/types/database';

type Order = Tables<'orders'>;

/**
 * Sends an order confirmation email to the customer.
 * Currently a stub — logs to console.
 */
export async function sendOrderConfirmation(order: Order): Promise<{ ok: true }> {
  console.log(
    `[EMAIL] Order confirmation for ${order.email}\n` +
      `  Order: ${order.order_number}\n` +
      `  Total: ₹${(order.total_amount / 100).toFixed(0)}\n` +
      `  Status: ${order.status}`,
  );
  return { ok: true };
}

/**
 * Sends a new order alert email to the admin.
 * Currently a stub — logs to console.
 */
export async function sendAdminNewOrderAlert(order: Order): Promise<{ ok: true }> {
  console.log(
    `[EMAIL] Admin new order alert\n` +
      `  Order: ${order.order_number}\n` +
      `  Customer: ${order.email} / ${order.phone}\n` +
      `  Total: ₹${(order.total_amount / 100).toFixed(0)}`,
  );
  return { ok: true };
}
