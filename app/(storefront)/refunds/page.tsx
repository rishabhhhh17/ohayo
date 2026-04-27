import type { Metadata } from 'next';
import { LegalPage } from '@/components/storefront/legal-page';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'How to cancel an order, return a pouch, and how refunds are processed.',
};

export default function RefundsPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy" updated="April 2026">
      <h2>Cancellations</h2>
      <p>
        You can cancel an order at no charge any time before it is dispatched. Email{' '}
        <a href="mailto:hello@blendstart.com">hello@blendstart.com</a> with your order number and
        we will confirm and refund.
      </p>
      <p>
        Once an order has been handed to the courier, it can no longer be cancelled. You can still
        return it under the rules below.
      </p>

      <h2>Returns</h2>
      <ul>
        <li>
          <strong>Unopened pouches</strong> can be returned within 7 days of delivery for a full
          refund of the product price.
        </li>
        <li>
          <strong>Opened pouches</strong> are not eligible for return for hygiene and food-safety
          reasons, except where the product is defective or damaged.
        </li>
        <li>
          <strong>Damaged or wrong items:</strong> contact us within 48 hours of delivery with
          photos. We will arrange a free replacement or full refund.
        </li>
      </ul>

      <h2>How to return</h2>
      <ol>
        <li>
          Email <a href="mailto:hello@blendstart.com">hello@blendstart.com</a> with your order
          number and reason for return.
        </li>
        <li>We will share a return address and pickup details.</li>
        <li>
          Once we receive and inspect the package, we will issue your refund within 5 business
          days.
        </li>
      </ol>

      <h2>Refund timeline</h2>
      <p>
        Approved refunds are credited to the original payment method via Razorpay. After we
        initiate the refund, your bank typically reflects it within 5–7 business days. UPI refunds
        are usually faster.
      </p>

      <h2>Contact</h2>
      <p>
        Anything unclear? Email <a href="mailto:hello@blendstart.com">hello@blendstart.com</a>.
      </p>
    </LegalPage>
  );
}
