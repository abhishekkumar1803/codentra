import { CheckoutCard } from '@/features/subscription/components/checkout-card';

export default function SubscribePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Subscribe</h1>
        <p className="mt-2 text-muted-foreground">
          Get full access to Codentra for ₹49/month
        </p>
      </div>
      <div className="w-full max-w-md">
        <CheckoutCard />
      </div>
    </div>
  );
}
