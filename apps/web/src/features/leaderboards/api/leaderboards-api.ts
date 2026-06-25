import type { LeaderboardEntry, LeaderboardRanking } from '@codentra/types';
import { api } from '@/shared/lib/api-client';

export type LeaderboardFilters = {
  period?: string;
  contestId?: string;
  page?: number;
  limit?: number;
};

export const leaderboardsApi = {
  list: (filters?: LeaderboardFilters) => {
    const search = new URLSearchParams();
    if (filters?.period) search.set('period', filters.period);
    if (filters?.contestId) search.set('contestId', filters.contestId);
    if (filters?.page) search.set('page', String(filters.page));
    if (filters?.limit) search.set('limit', String(filters.limit));
    const qs = search.toString();
    return api.get<{
      items: LeaderboardEntry[];
      meta: {
        period: string;
        page: number;
        limit: number;
        total: number;
        contestId?: string;
      };
    }>(`/leaderboards${qs ? `?${qs}` : ''}`);
  },

  getMyRankings: () =>
    api.get<{ rankings: LeaderboardRanking[] }>('/leaderboards/me'),
};
