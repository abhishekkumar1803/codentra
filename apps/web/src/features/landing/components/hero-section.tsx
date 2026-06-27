'use client';

import Link from 'next/link';
import { Button } from '@codentra/ui';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAuthStore } from '@/shared/stores/auth-store';
import { HeroCodeBackground } from './hero-code-background';

export function HeroSection() {
  const sessionReady = useAuthStore((s) => s.sessionReady);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: user } = useAuth();
  const isLoggedIn = sessionReady && !!accessToken && !!user;
  const firstName = user?.name?.split(' ')[0];

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
      <HeroCodeBackground />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="animate-float mb-6 inline-flex items-center rounded-full border bg-background/90 px-4 py-1.5 text-sm text-foreground backdrop-blur-sm shadow-sm">
          ✨ Built for developers preparing for top tech roles
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Learn. Compete.{' '}
          <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
            Grow.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl rounded-2xl bg-background/90 px-6 py-4 text-lg font-medium leading-relaxed text-foreground shadow-lg backdrop-blur-md sm:text-xl">
          DSA contests, competitive programming, system design challenges, job
          discovery, and career services — all in one platform for just
          ₹49/month.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {!sessionReady ? (
            <div className="h-11 w-48 animate-pulse rounded-md bg-muted" />
          ) : isLoggedIn ? (
            <>
              <Link href="/contests">
                <Button
                  size="lg"
                  className="transition-transform hover:scale-105"
                >
                  Go to Contests →
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  Open Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button
                  size="lg"
                  className="transition-transform hover:scale-105"
                >
                  Start for ₹49/month
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg">
                  Explore Features
                </Button>
              </a>
            </>
          )}
        </div>

        {isLoggedIn && firstName ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Welcome back, {firstName} — keep climbing the leaderboard
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Cancel anytime · No hidden fees
          </p>
        )}
      </div>
    </section>
  );
}
