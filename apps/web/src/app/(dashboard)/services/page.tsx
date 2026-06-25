'use client';

import { ServicesCatalog, ServicesPageHeader } from '@/features/services/components/services-catalog';

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <ServicesPageHeader />
      <ServicesCatalog />
    </div>
  );
}
