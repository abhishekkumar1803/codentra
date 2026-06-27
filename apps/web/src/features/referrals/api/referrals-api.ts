import type { ReferralListItem } from '@codentra/types';
import { api } from '@/shared/lib/api-client';

export type ReferralFilters = {
  page?: number;
  limit?: number;
  status?: string;
  company?: string;
  search?: string;
};

export type CreateReferralPayload = {
  company: string;
  roleTitle: string;
  description: string;
  requirements?: string;
  contactEmail?: string;
};

export const referralsApi = {
  list: (filters?: ReferralFilters) => {
    const search = new URLSearchParams();
    if (filters?.page) search.set('page', String(filters.page));
    if (filters?.limit) search.set('limit', String(filters.limit));
    if (filters?.status) search.set('status', filters.status);
    if (filters?.company) search.set('company', filters.company);
    if (filters?.search) search.set('search', filters.search);
    const qs = search.toString();
    return api.get<{
      items: ReferralListItem[];
      meta: { page: number; limit: number; total: number };
    }>(`/referrals${qs ? `?${qs}` : ''}`);
  },

  listMine: (filters?: ReferralFilters) => {
    const search = new URLSearchParams();
    if (filters?.status) search.set('status', filters.status);
    const qs = search.toString();
    return api.get<{
      items: ReferralListItem[];
      meta: { page: number; limit: number; total: number };
    }>(`/referrals/me${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => api.get<ReferralListItem>(`/referrals/${id}`),

  create: (payload: CreateReferralPayload) =>
    api.post<ReferralListItem>('/referrals', payload),

  update: (
    id: string,
    payload: Partial<CreateReferralPayload & { status: string }>,
  ) => api.patch<ReferralListItem>(`/referrals/${id}`, payload),

  close: (id: string) => api.delete<{ message: string }>(`/referrals/${id}`),

  expressInterest: (id: string, message?: string) =>
    api.post<{
      message: string;
      contactEmail: string | null;
      mailtoLink: string | null;
    }>(`/referrals/${id}/express-interest`, { message }),
};
