import type { Metadata } from 'next';
import { LegalPage } from '@/components/storefront/legal-page';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How BlendStart collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="April 2026">
      <p>
        BlendStart (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy. This policy explains
        what data we collect when you visit blendstart.in or place an order, how we use it, and the
        choices you have.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Order information:</strong> name, email, phone, shipping address, and the items
          you purchase. You provide this at checkout.
        </li>
        <li>
          <strong>Payment information:</strong> processed entirely by Razorpay. We never see, store,
          or have access to your card or UPI details.
        </li>
        <li>
          <strong>Device and usage data:</strong> standard server logs (IP address, browser, pages
          visited) used to keep the site running and prevent abuse.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To fulfil and ship your orders, send confirmations, and handle returns.</li>
        <li>To respond to support emails you send us.</li>
        <li>To meet legal and tax obligations in India.</li>
        <li>
          With your explicit opt-in, to send the occasional product update by email. You can
          unsubscribe at any time using the link in any email.
        </li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We share the minimum information needed to deliver your order with: Razorpay (payment),
        our shipping courier (name, address, phone), and our cloud host (Vercel). We do not sell
        your data to advertisers or list brokers, ever.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Order records are retained for 7 years to comply with Indian tax law. Marketing email
        addresses are kept until you unsubscribe.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us at any time to access, correct, or delete the personal information we hold
        about you. Email{' '}
        <a href="mailto:hello@blendstart.com">hello@blendstart.com</a> from the address tied to your
        order.
      </p>

      <h2>Cookies</h2>
      <p>
        We use a single cookie to remember the items in your cart between visits. We do not use
        third-party advertising or analytics cookies on this site.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email{' '}
        <a href="mailto:hello@blendstart.com">hello@blendstart.com</a>.
      </p>
    </LegalPage>
  );
}
