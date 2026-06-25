'use client';

import { useState } from 'react';
import { Card, CardContent, Skeleton } from '@codentra/ui';
import { useAdminPayments } from '@/features/admin/hooks/use-admin';

export default function AdminPaymentsPage() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useAdminPayments(status || undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="mt-1 text-muted-foreground">All payment transactions.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['', 'SUCCESS', 'FAILED', 'PENDING'].map((s) => (
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
              {data?.items.map((p) => (
                <li key={p.id} className="flex justify-between py-3">
                  <div>
                    <p className="font-medium">{p.userName}</p>
                    <p className="text-muted-foreground">
                      {p.type} · {p.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ₹{(p.amount / 100).toLocaleString('en-IN')}
                    </p>
                    <p className="text-muted-foreground">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString('en-IN')
                        : '—'}
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
