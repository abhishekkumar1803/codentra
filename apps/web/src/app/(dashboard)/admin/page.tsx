'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@codentra/ui';
import { useAdminDashboard } from '@/features/admin/hooks/use-admin';

function formatCurrency(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function AdminOverviewPage() {
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Failed to load admin metrics.
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    { label: 'Total users', value: data.totalUsers.toLocaleString() },
    {
      label: 'Active subscribers',
      value: data.activeSubscribers.toLocaleString(),
    },
    { label: 'Revenue this month', value: formatCurrency(data.monthlyRevenue) },
    {
      label: 'New users this month',
      value: data.newUsersThisMonth.toLocaleString(),
    },
    {
      label: 'Churn rate',
      value: `${(data.churnRate * 100).toFixed(1)}%`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin overview</h1>
        <p className="mt-1 text-muted-foreground">
          Platform metrics at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {m.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
