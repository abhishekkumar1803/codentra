'use client';

import Link from 'next/link';
import { Button, Card, CardContent, Skeleton } from '@codentra/ui';
import { useMyBookings } from '@/features/services/hooks/use-services';

function formatPrice(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function ServiceBookingsPage() {
  const { data, isLoading } = useMyBookings();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My bookings</h1>
          <p className="mt-1 text-muted-foreground">
            Track your premium service requests.
          </p>
        </div>
        <Link href="/services">
          <Button variant="outline">Browse services</Button>
        </Link>
      </div>

      {isLoading && <Skeleton className="h-40 w-full" />}

      {data?.items.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No bookings yet.{' '}
            <Link href="/services" className="text-primary underline">
              Book a service
            </Link>
          </CardContent>
        </Card>
      )}

      {data?.items.length ? (
        <div className="space-y-3">
          {data.items.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">{booking.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(booking.amount)} · {booking.status}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
