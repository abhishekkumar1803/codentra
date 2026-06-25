'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ServiceCatalogItem } from '@codentra/types';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@codentra/ui';
import { useServiceCatalog } from '../hooks/use-services';
import { ServiceBookingDialog } from './service-booking-dialog';

function formatPrice(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export function ServicesCatalog() {
  const { data, isLoading, error } = useServiceCatalog();
  const [selectedService, setSelectedService] =
    useState<ServiceCatalogItem | null>(null);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading services...</p>;
  }

  if (error || !data?.items.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Services are unavailable right now.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {data.items.map((service) => (
          <Card key={service.type}>
            <CardHeader>
              <CardTitle className="text-lg">{service.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>
              <p className="font-semibold">
                {formatPrice(service.amount)}
                {service.durationMinutes
                  ? ` · ${service.durationMinutes} min`
                  : ''}
              </p>
              <Button onClick={() => setSelectedService(service)}>
                Book now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <ServiceBookingDialog
        service={selectedService}
        open={!!selectedService}
        onClose={() => setSelectedService(null)}
      />
    </>
  );
}

export function ServicesPageHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Premium services</h1>
        <p className="mt-1 text-muted-foreground">
          Expert career support beyond membership.
        </p>
      </div>
      <Link href="/services/bookings">
        <Button variant="outline">My bookings</Button>
      </Link>
    </div>
  );
}
