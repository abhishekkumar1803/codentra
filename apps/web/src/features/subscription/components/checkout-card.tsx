'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@codentra/ui';
import { ApiError } from '@/shared/lib/api-client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  useCreateSubscription,
  usePollSubscriptionUntilActive,
  useSubscription,
} from '../hooks/use-subscription';
import { openRazorpayCheckout } from '../lib/razorpay';
import { MEMBERSHIP_FEATURES } from '@/features/landing/constants/features';
import { SubscriptionStatus } from './subscription-status';

export function CheckoutCard() {
  const router = useRouter();
  const { data: user } = useAuth();
  const { data: subscription, isLoading } = useSubscription();
  const createSubscription = useCreateSubscription();
  const [polling, setPolling] = useState(false);
  const { data: polledSub } = usePollSubscriptionUntilActive(polling);

  const isActive = subscription?.status === 'ACTIVE';
  const isPending = subscription?.status === 'PENDING';

  useEffect(() => {
    if (polledSub?.status === 'ACTIVE') {
      setPolling(false);
      router.push('/dashboard');
    }
  }, [polledSub, router]);

  const handleSubscribe = async () => {
    try {
      const checkout = await createSubscription.mutateAsync();

      if (checkout.razorpayKeyId.startsWith('rzp_test_mock')) {
        setPolling(true);
        return;
      }

      const opened = await openRazorpayCheckout({
        key: checkout.razorpayKeyId,
        subscriptionId: checkout.razorpaySubscriptionId,
        userName: user?.name,
        userEmail: user?.email,
        onSuccess: () => setPolling(true),
        onDismiss: () => setPolling(false),
      });

      if (!opened) {
        setPolling(true);
      }
    } catch {
      // error shown below
    }
  };

  const errorMessage =
    createSubscription.error instanceof ApiError
      ? createSubscription.error.code === 'SUBSCRIPTION_EXISTS'
        ? 'You already have an active subscription.'
        : createSubscription.error.message
      : createSubscription.error
        ? 'Failed to start checkout. Please try again.'
        : null;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  if (isActive) {
    return (
      <div className="space-y-4">
        <SubscriptionStatus subscription={subscription} />
        <Button className="w-full" onClick={() => router.push('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-primary shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Codentra Membership</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">₹49</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ul className="space-y-2">
          {MEMBERSHIP_FEATURES.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm">
              <span className="text-primary">✓</span>
              {item}
            </li>
          ))}
        </ul>

        {isPending && (
          <p className="text-center text-sm text-muted-foreground">
            Confirming your payment...
          </p>
        )}

        {errorMessage && (
          <p className="text-center text-sm text-red-600">{errorMessage}</p>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleSubscribe}
          disabled={createSubscription.isPending || polling || isPending}
        >
          {createSubscription.isPending || polling || isPending
            ? 'Processing...'
            : 'Subscribe Now'}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Secure payment powered by Razorpay. Cancel anytime.
        </p>
      </CardContent>
    </Card>
  );
}
