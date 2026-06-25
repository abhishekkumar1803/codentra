import { Navbar } from '@/shared/components/layout/navbar';
import { Footer } from '@/shared/components/layout/footer';
import { FaqSection } from '@/features/landing/components/faq-section';

export const metadata = {
  title: 'FAQ — Codentra',
  description: 'Frequently asked questions about Codentra membership and features.',
};

export default function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
