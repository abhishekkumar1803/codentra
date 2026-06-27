import type { AuthResponse, AuthUser } from '@codentra/types';
import { api } from '@/shared/lib/api-client';
import { useAuthStore } from '@/shared/stores/auth-store';

function setToken(token: string | null) {
  useAuthStore.getState().setAccessToken(token);
}

export const authApi = {
  register: async (data: { email: string; password: string; name: string }) => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    setToken(res.accessToken);
    return res;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    setToken(res.accessToken);
    return res;
  },

  google: async (code: string) => {
    const res = await api.post<AuthResponse>('/auth/google', { code });
    setToken(res.accessToken);
    return res;
  },

  logout: async () => {
    await api.post('/auth/logout');
    useAuthStore.getState().clearAuth();
  },

  me: () => api.get<AuthUser>('/auth/me'),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>('/auth/reset-password', { token, password }),
};
