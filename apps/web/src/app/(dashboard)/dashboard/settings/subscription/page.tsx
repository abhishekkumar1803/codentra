'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@codentra/ui';
import { CheckoutCard } from '@/features/subscription/components/checkout-card';
import { SubscriptionStatus } from '@/features/subscription/components/subscription-status';
import {
  useCancelSubscription,
  usePaymentHistory,
  useSubscription,
} from '@/features/subscription/hooks/use-subscription';

export default function SubscriptionSettingsPage() {
  const { data: subscription, isLoading } = useSubscription();
  const cancelSubscription = useCancelSubscription();
  const { data: payments, isLoading: paymentsLoading } = usePaymentHistory();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const isActive = subscription?.status === 'ACTIVE';

  if (isLoading) {
    return <Skeleton className="mx-auto h-64 max-w-2xl w-full" />;
  }

  if (!subscription || subscription.status === 'EXPIRED') {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Subscription</h1>
          <p className="text-muted-foreground">
            Get full access to Codentra for ₹49/month.
          </p>
        </div>
        <CheckoutCard />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Manage your membership plan.</p>
      </div>

      <SubscriptionStatus subscription={subscription} />

      {isActive && (
        <Card>
          <CardHeader>
            <CardTitle>Cancel membership</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You will retain access until the end of your current billing
              period.
            </p>
            {!showCancelConfirm ? (
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel subscription
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Keep subscription
                </Button>
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={cancelSubscription.isPending}
                  onClick={() => cancelSubscription.mutate()}
                >
                  {cancelSubscription.isPending
                    ? 'Cancelling...'
                    : 'Confirm cancel'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : payments?.items.length ? (
            <ul className="divide-y">
              {payments.items.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span>
                    ₹{(p.amount / 100).toFixed(0)} — {p.status}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
