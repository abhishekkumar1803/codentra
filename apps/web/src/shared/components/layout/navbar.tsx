'use client';

import Link from 'next/link';
import { Button, cn } from '@codentra/ui';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAuthStore } from '@/shared/stores/auth-store';

const navLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
];

export function Navbar() {
  const sessionReady = useAuthStore((s) => s.sessionReady);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: user } = useAuth();
  const isLoggedIn = sessionReady && !!accessToken && !!user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              'bg-primary text-sm font-bold text-primary-foreground',
            )}
          >
            C
          </span>
          <span className="text-lg font-bold tracking-tight">Codentra</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex min-h-9 items-center gap-2">
          {!sessionReady ? (
            <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
          ) : isLoggedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <span className="mr-1.5" aria-hidden>
                    ⊞
                  </span>
                  Dashboard
                </Button>
              </Link>
              <Link href="/contests">
                <Button size="sm">
                  <span className="mr-1.5" aria-hidden>
                    🏆
                  </span>
                  Contests
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
