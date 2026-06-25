import Link from 'next/link';
import { Button } from '@codentra/ui';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground">
          Built for developers in India 🇮🇳
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Learn. Compete.{' '}
          <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
            Grow.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Participate in DSA contests, competitive programming, system design
          challenges, and accelerate your career — all in one platform.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button size="lg">Start for ₹49/month</Button>
          </Link>
          <a href="#features">
            <Button variant="outline" size="lg">
              Explore Features
            </Button>
          </a>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Cancel anytime · No hidden fees
        </p>
      </div>
    </section>
  );
}
