import type { Metadata } from 'next';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { SiteHeader } from '@/components/storefront/site-header';
import { SiteFooter } from '@/components/storefront/site-footer';
import { CartHydrator } from '@/components/storefront/cart-hydrator';

export const metadata: Metadata = {
  title: {
    template: '%s | BlendStart',
    default: 'BlendStart — The Morning Fuel',
  },
  description:
    'A premium breakfast drink mix. 23g protein, 11g fibre, electrolytes. Salted caramel cocoa, ready in 20 seconds.',
  openGraph: {
    title: 'BlendStart — The Morning Fuel',
    description:
      'A premium breakfast drink mix. 23g protein, 11g fibre, electrolytes. Salted caramel cocoa, ready in 20 seconds.',
    siteName: 'BlendStart',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlendStart — The Morning Fuel',
    description:
      'A premium breakfast drink mix. 23g protein, 11g fibre, electrolytes. Salted caramel cocoa, ready in 20 seconds.',
  },
};

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CartHydrator />
      <AnnouncementBar />
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
