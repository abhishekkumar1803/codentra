import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@codentra/ui';
import { Navbar } from '@/shared/components/layout/navbar';
import { Footer } from '@/shared/components/layout/footer';
import {
  MEMBERSHIP_FEATURES,
  PREMIUM_SERVICE_PRICES,
} from '@/features/landing/constants/features';

export const metadata = {
  title: 'Pricing — Codentra',
  description: 'Simple, affordable pricing for developers.',
};

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, affordable pricing
          </h1>
          <p className="mt-4 text-muted-foreground">
            Full platform access for less than a cup of coffee per day.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
          <Card className="relative border-primary shadow-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Most Popular
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Codentra Membership</CardTitle>
              <p className="text-sm text-muted-foreground">
                Everything you need to learn and compete
              </p>
              <div className="mt-4">
                <span className="text-4xl font-bold">₹49</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {MEMBERSHIP_FEATURES.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/subscribe" className="mt-6 block">
                <Button className="w-full" size="lg">
                  Subscribe — ₹49/mo
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Premium Services</CardTitle>
              <p className="text-sm text-muted-foreground">
                Expert career support — pay per service
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {PREMIUM_SERVICE_PRICES.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{item.name}</span>
                    <span className="font-medium">{item.price}</span>
                  </li>
                ))}
              </ul>
              <Link href="/services" className="mt-6 block">
                <Button variant="outline" className="w-full">
                  View services
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
