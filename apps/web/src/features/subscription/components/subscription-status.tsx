'use client';

import { Card, CardContent, CardHeader, CardTitle, cn } from '@codentra/ui';
import type { Subscription } from '@codentra/types';

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAST_DUE: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  EXPIRED: 'bg-red-100 text-red-800',
};

export function SubscriptionStatus({
  subscription,
  className,
}: {
  subscription: Subscription | null | undefined;
  className?: string;
}) {
  if (!subscription) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">No active subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Subscribe to unlock contests, leaderboards, and premium features.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusClass = statusStyles[subscription.status] ?? statusStyles.PENDING;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Membership</CardTitle>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium',
            statusClass,
          )}
        >
          {subscription.status}
        </span>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {subscription.status === 'ACTIVE' && (
          <p className="text-muted-foreground">
            Renews on{' '}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
        {subscription.status === 'CANCELLED' && (
          <p className="text-muted-foreground">
            Access until{' '}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
        {subscription.status === 'PENDING' && (
          <p className="text-muted-foreground">
            Payment processing — this may take a moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
