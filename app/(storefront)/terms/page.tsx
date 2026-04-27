import type { Metadata } from 'next';
import { LegalPage } from '@/components/storefront/legal-page';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'The terms that apply when you buy from BlendStart.',
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="April 2026">
      <p>
        These terms govern your purchase from blendstart.in. Placing an order means you agree to
        them.
      </p>

      <h2>The product</h2>
      <p>
        BlendStart is a breakfast drink mix, not a medicine, and is not intended to diagnose,
        treat, cure, or prevent any disease. If you have a medical condition, are pregnant, or take
        prescription medication, talk to your doctor before adding any new supplement to your diet.
      </p>

      <h2>Pricing and orders</h2>
      <ul>
        <li>All prices are in Indian Rupees (INR) and inclusive of applicable GST.</li>
        <li>
          We reserve the right to refuse or cancel an order if there is a clear pricing error,
          stock issue, or suspected fraud, and will refund any amount already charged.
        </li>
        <li>
          An order is confirmed only after payment is captured by Razorpay and you receive a
          confirmation email from us.
        </li>
      </ul>

      <h2>Payment</h2>
      <p>
        Payments are processed by Razorpay. We do not store your card or UPI credentials. By
        completing a payment you accept Razorpay&apos;s terms in addition to ours.
      </p>

      <h2>Shipping &amp; returns</h2>
      <p>
        See our <a href="/shipping">Shipping Policy</a> and{' '}
        <a href="/refunds">Refund &amp; Cancellation Policy</a> for delivery timelines and how
        returns are handled.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You agree not to attempt to disrupt the site, scrape it at scale, or place fraudulent
        orders. We may suspend service to any account or address that violates these rules.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        Our liability for any single order is capped at the amount you paid for that order. We are
        not liable for indirect or consequential losses such as lost profits.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India. Any dispute will be subject to the exclusive
        jurisdiction of the courts of Bengaluru, Karnataka.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href="mailto:hello@blendstart.com">hello@blendstart.com</a>.
      </p>
    </LegalPage>
  );
}
