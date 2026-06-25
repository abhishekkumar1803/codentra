import { Navbar } from '@/shared/components/layout/navbar';
import { Footer } from '@/shared/components/layout/footer';
import { HeroSection } from '@/features/landing/components/hero-section';
import { FeaturesSection } from '@/features/landing/components/features-section';
import { PricingSection } from '@/features/landing/components/pricing-section';
import { CtaSection } from '@/features/landing/components/cta-section';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
