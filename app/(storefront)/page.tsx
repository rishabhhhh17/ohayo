import type { Metadata } from 'next';
import { Hero } from '@/components/storefront/hero';
import { MarqueeStrip } from '@/components/storefront/marquee-strip';
import { CategoryTiles } from '@/components/storefront/category-tiles';
import { ComfortCallouts } from '@/components/storefront/comfort-callouts';
import { HowItWorks } from '@/components/storefront/how-it-works';
import { EditorialSplit } from '@/components/storefront/editorial-split';
import { NutritionCard } from '@/components/storefront/nutrition-card';
import { Testimonials } from '@/components/storefront/testimonials';
import { FaqSection } from '@/components/storefront/faq-section';
import { NewsletterCta } from '@/components/storefront/newsletter-cta';

export const metadata: Metadata = {
  title: 'BlendStart — The Morning Fuel',
  description:
    'A premium breakfast drink mix. 23g protein, 11g fibre, electrolytes. Salted caramel cocoa, ready in 20 seconds.',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarqueeStrip />
      <CategoryTiles />
      <ComfortCallouts />
      <HowItWorks />
      <EditorialSplit />
      <NutritionCard />
      <Testimonials />
      <FaqSection />
      <NewsletterCta />
    </>
  );
}
