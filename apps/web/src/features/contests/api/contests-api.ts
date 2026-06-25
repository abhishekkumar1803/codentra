import type {
  ContestDetail,
  ContestListItem,
  ContestParticipant,
} from '@codentra/types';
import { api } from '@/shared/lib/api-client';

export type ContestFilters = {
  page?: number;
  limit?: number;
  type?: string;
  excludeType?: string;
  status?: string;
};

export const contestsApi = {
  list: (filters?: ContestFilters) => {
    const search = new URLSearchParams();
    if (filters?.page) search.set('page', String(filters.page));
    if (filters?.limit) search.set('limit', String(filters.limit));
    if (filters?.type) search.set('type', filters.type);
    if (filters?.excludeType) search.set('excludeType', filters.excludeType);
    if (filters?.status) search.set('status', filters.status);
    const qs = search.toString();
    return api.get<{
      items: ContestListItem[];
      meta: { page: number; limit: number; total: number };
    }>(`/contests${qs ? `?${qs}` : ''}`);
  },

  getBySlug: (slug: string) => api.get<ContestDetail>(`/contests/${slug}`),

  join: (contestId: string) =>
    api.post<{
      id: string;
      contestId: string;
      status: string;
      joinedAt: string;
    }>(`/contests/${contestId}/join`),

  getParticipants: (contestId: string, page = 1) =>
    api.get<{
      items: ContestParticipant[];
      meta: { page: number; limit: number; total: number };
    }>(`/contests/${contestId}/participants?page=${page}&limit=20`),
};
