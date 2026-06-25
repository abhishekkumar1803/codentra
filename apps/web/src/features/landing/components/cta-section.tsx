'use client';

import Link from 'next/link';
import { Button } from '@codentra/ui';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAuthStore } from '@/shared/stores/auth-store';

export function CtaSection() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: user } = useAuth();
  const isLoggedIn = !!accessToken && !!user;

  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {isLoggedIn ? 'Keep your momentum going' : 'Ready to accelerate your career?'}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
          {isLoggedIn
            ? 'Jump back into contests, track your ratings, and climb the leaderboard.'
            : 'Join thousands of developers learning, competing, and growing on Codentra.'}
        </p>
        <Link
          href={isLoggedIn ? '/contests' : '/register'}
          className="mt-8 inline-block"
        >
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            {isLoggedIn ? 'Continue Competing' : 'Create Free Account'}
          </Button>
        </Link>
      </div>
    </section>
  );
}
