'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { getAccessToken, setAccessToken } from '../lib/api-client';

async function tryRefreshToken(): Promise<string | null> {
  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1`;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.accessToken ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setStoreToken = useAuthStore((s) => s.setAccessToken);
  const setSessionReady = useAuthStore((s) => s.setSessionReady);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = getAccessToken() ?? useAuthStore.getState().accessToken;
      if (token) {
        setAccessToken(token);
        setStoreToken(token);
        if (!cancelled) setSessionReady(true);
        return;
      }

      const refreshed = await tryRefreshToken();
      if (!cancelled) {
        if (refreshed) setStoreToken(refreshed);
        setSessionReady(true);
      }
    }

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      void bootstrap();
    });

    if (useAuthStore.persist.hasHydrated()) {
      void bootstrap();
    }

    return () => {
      cancelled = true;
      unsub();
    };
  }, [setStoreToken, setSessionReady]);

  return <>{children}</>;
}
