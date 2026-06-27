import type {
  ContestHistoryEntry,
  RatingHistoryEntry,
  UserProfile,
  UserStats,
} from '@codentra/types';
import { api, getAccessToken } from '@/shared/lib/api-client';

export const usersApi = {
  getStats: () => api.get<UserStats>('/users/me/stats'),
  getProfile: () => api.get<UserProfile>('/users/me'),
  getRatingHistory: (type?: string) => {
    const qs = type ? `?type=${type}` : '';
    return api.get<{ items: RatingHistoryEntry[] }>(
      `/users/me/rating-history${qs}`,
    );
  },
  getContestHistory: () =>
    api.get<{ items: ContestHistoryEntry[] }>('/users/me/contest-history'),
  updateProfile: (data: Partial<UserProfile>) =>
    api.patch<UserProfile>('/users/me', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<{ message: string }>('/users/me/password', {
      currentPassword,
      newPassword,
    }),
  uploadAvatar: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const token = getAccessToken();
    const base = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1`;
    const res = await fetch(`${base}/users/me/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
      credentials: 'include',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? 'Upload failed');
    return json.data as { avatarUrl: string };
  },
};
