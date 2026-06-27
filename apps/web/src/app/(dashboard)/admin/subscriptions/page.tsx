'use client';

import { useState } from 'react';
import { Card, CardContent, Skeleton } from '@codentra/ui';
import { useAdminSubscriptions } from '@/features/admin/hooks/use-admin';

export default function AdminSubscriptionsPage() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useAdminSubscriptions(status || undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="mt-1 text-muted-foreground">
          All membership subscriptions.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['', 'ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING'].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              status === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <ul className="divide-y text-sm">
              {data?.items.map((s) => (
                <li key={s.id} className="flex justify-between py-3">
                  <div>
                    <p className="font-medium">{s.userName}</p>
                    <p className="text-muted-foreground">{s.userEmail}</p>
                  </div>
                  <div className="text-right text-muted-foreground">
                    <p>{s.status}</p>
                    <p>
                      until{' '}
                      {new Date(s.currentPeriodEnd).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
