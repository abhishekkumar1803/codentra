import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@codentra/ui';
import {
  MEMBERSHIP_FEATURES,
  PREMIUM_SERVICES,
} from '../constants/features';

export function PricingSection() {
  return (
    <section id="pricing" className="bg-muted/30 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            One membership. Full access. Premium services available à la carte.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <Card className="relative border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Most Popular
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Membership</CardTitle>
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
              <p className="mt-2 text-sm text-muted-foreground">
                Available separately for members
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {PREMIUM_SERVICES.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">+</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Book premium services from your dashboard after subscribing.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
