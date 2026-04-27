import type { Metadata } from 'next';
import { LegalPage } from '@/components/storefront/legal-page';

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: 'Shipping rates, dispatch times, and delivery windows for BlendStart orders.',
};

export default function ShippingPage() {
  return (
    <LegalPage title="Shipping Policy" updated="April 2026">
      <h2>Where we ship</h2>
      <p>
        We currently ship to all serviceable pincodes across India. We do not ship internationally
        yet.
      </p>

      <h2>Rates</h2>
      <ul>
        <li>Flat ₹49 shipping on orders below ₹999.</li>
        <li>Free shipping on orders ₹999 and above.</li>
      </ul>

      <h2>Dispatch &amp; delivery</h2>
      <ul>
        <li>Orders placed before 4&nbsp;PM IST are dispatched the same business day.</li>
        <li>Orders placed after 4&nbsp;PM IST are dispatched the next business day.</li>
        <li>
          Estimated delivery is <strong>2–4 business days</strong> for metro pincodes and{' '}
          <strong>4–7 business days</strong> elsewhere.
        </li>
        <li>You will receive a tracking link by email once your order is dispatched.</li>
      </ul>

      <h2>Delays</h2>
      <p>
        Once a package is handed to the courier, delivery times are subject to their network. We
        cannot guarantee delivery on a specific date but will help you track and follow up if a
        package is delayed beyond the estimate. Email{' '}
        <a href="mailto:hello@blendstart.com">hello@blendstart.com</a> with your order number.
      </p>

      <h2>Lost or damaged packages</h2>
      <p>
        If a package is marked delivered but you have not received it, or if it arrives damaged,
        contact us within 48 hours of the delivery scan with photos. We will either re-ship or
        refund.
      </p>
    </LegalPage>
  );
}
