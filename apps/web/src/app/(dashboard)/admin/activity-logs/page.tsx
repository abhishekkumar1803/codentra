'use client';

import { useState } from 'react';
import { Card, CardContent, Skeleton } from '@codentra/ui';
import { useAdminActivityLogs } from '@/features/admin/hooks/use-admin';

export default function AdminActivityLogsPage() {
  const [action, setAction] = useState('');
  const { data, isLoading } = useAdminActivityLogs(action || undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity logs</h1>
        <p className="mt-1 text-muted-foreground">
          Audit trail of platform events.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['', 'user.login', 'user.register', 'admin.user.update'].map((a) => (
          <button
            key={a || 'all'}
            type="button"
            onClick={() => setAction(a)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              action === a
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {a || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <ul className="divide-y text-sm">
              {data?.items.map((log) => (
                <li key={log.id} className="py-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-medium">{log.action}</span>
                    <span className="text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {log.userName ?? 'System'}
                    {log.userEmail ? ` (${log.userEmail})` : ''}
                    {log.entityType
                      ? ` · ${log.entityType}:${log.entityId}`
                      : ''}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
