'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '@codentra/types';
import { usersApi } from '../api/users-api';

export function useUserStats() {
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: usersApi.getStats,
  });
}

export function useRatingHistory(type?: string) {
  return useQuery({
    queryKey: ['users', 'rating-history', type],
    queryFn: () => usersApi.getRatingHistory(type),
  });
}

export function useContestHistory() {
  return useQuery({
    queryKey: ['users', 'contest-history'],
    queryFn: usersApi.getContestHistory,
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['users', 'profile'],
    queryFn: usersApi.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => usersApi.updateProfile(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => usersApi.changePassword(currentPassword, newPassword),
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
