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

  useEffect(() => {
    const token = getAccessToken() ?? useAuthStore.getState().accessToken;
    if (token) {
      setAccessToken(token);
      setStoreToken(token);
      return;
    }

    void tryRefreshToken().then((refreshed) => {
      if (refreshed) {
        setStoreToken(refreshed);
      }
    });
  }, [setStoreToken]);

  return <>{children}</>;
}
