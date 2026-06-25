'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth-api';

export function GoogleCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error || !code) {
      router.replace('/login?error=google_auth_failed');
      return;
    }

    called.current = true;

    authApi
      .google(code)
      .then(() => router.replace('/dashboard'))
      .catch(() => router.replace('/login?error=google_auth_failed'));
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Signing you in with Google...</p>
    </div>
  );
}
