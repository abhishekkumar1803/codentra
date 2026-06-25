'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  referralsApi,
  type CreateReferralPayload,
  type ReferralFilters,
} from '../api/referrals-api';

export function useReferrals(filters?: ReferralFilters) {
  return useQuery({
    queryKey: ['referrals', 'list', filters],
    queryFn: () => referralsApi.list(filters),
  });
}

export function useMyReferrals() {
  return useQuery({
    queryKey: ['referrals', 'mine'],
    queryFn: () => referralsApi.listMine(),
  });
}

export function useReferral(id: string) {
  return useQuery({
    queryKey: ['referrals', id],
    queryFn: () => referralsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReferralPayload) =>
      referralsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });
}

export function useCloseReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => referralsApi.close(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });
}

export function useExpressInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message?: string }) =>
      referralsApi.expressInterest(id, message),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });
}
