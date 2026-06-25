import type { CheckoutResponse, Payment, Subscription } from '@codentra/types';
import { api } from '@/shared/lib/api-client';

export const subscriptionApi = {
  getMe: () => api.get<Subscription | null>('/subscriptions/me'),

  create: (planId?: string) =>
    api.post<CheckoutResponse>('/subscriptions', planId ? { planId } : {}),

  cancel: () =>
    api.post<{ subscription: Subscription }>('/subscriptions/cancel'),

  getPayments: (params?: { page?: number; limit?: number; type?: string }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.type) search.set('type', params.type);
    const qs = search.toString();
    return api.get<{ items: Payment[]; meta: { page: number; limit: number; total: number } }>(
      `/payments/me${qs ? `?${qs}` : ''}`,
    );
  },
};
