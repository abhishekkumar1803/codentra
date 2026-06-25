'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '../api/subscription-api';

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: subscriptionApi.getMe,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionApi.create(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['subscription', 'me'] });
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscriptionApi.cancel,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['subscription', 'me'] });
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function usePaymentHistory(page = 1) {
  return useQuery({
    queryKey: ['payments', 'me', page],
    queryFn: () => subscriptionApi.getPayments({ page, type: 'SUBSCRIPTION' }),
  });
}

export function usePollSubscriptionUntilActive(enabled: boolean) {
  return useQuery({
    queryKey: ['subscription', 'poll'],
    queryFn: subscriptionApi.getMe,
    enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'ACTIVE') return false;
      return 2000;
    },
  });
}
