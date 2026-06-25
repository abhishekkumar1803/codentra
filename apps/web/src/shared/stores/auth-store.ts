'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAccessToken as setApiAccessToken } from '../lib/api-client';

const AUTH_COOKIE = 'access_token';

function setAuthCookie(token: string | null) {
  if (typeof document === 'undefined') return;
  if (token) {
    document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=900; samesite=lax`;
  } else {
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
  }
}

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      setAccessToken: (token) => {
        setApiAccessToken(token);
        setAuthCookie(token);
        set({ accessToken: token });
      },
      clearAuth: () => {
        setApiAccessToken(null);
        setAuthCookie(null);
        set({ accessToken: null });
      },
    }),
    {
      name: 'codentra-auth',
      partialize: (state) => ({ accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setApiAccessToken(state.accessToken);
          setAuthCookie(state.accessToken);
        }
      },
    },
  ),
);
