'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin-api';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard(),
  });
}

export function useAdminUsers(params?: {
  search?: string;
  role?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.listUsers({ ...params, limit: 50 }),
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { role?: string; isActive?: boolean };
    }) => adminApi.updateUser(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminSubscriptions(status?: string) {
  return useQuery({
    queryKey: ['admin', 'subscriptions', status],
    queryFn: () => adminApi.listSubscriptions({ status, limit: 50 }),
  });
}

export function useAdminPayments(status?: string) {
  return useQuery({
    queryKey: ['admin', 'payments', status],
    queryFn: () => adminApi.listPayments({ status, limit: 50 }),
  });
}

export function useAdminActivityLogs(action?: string) {
  return useQuery({
    queryKey: ['admin', 'activity-logs', action],
    queryFn: () => adminApi.listActivityLogs({ action, limit: 50 }),
  });
}
