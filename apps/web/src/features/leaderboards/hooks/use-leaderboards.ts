'use client';

import { useQuery } from '@tanstack/react-query';
import {
  leaderboardsApi,
  type LeaderboardFilters,
} from '../api/leaderboards-api';

export function useLeaderboard(filters?: LeaderboardFilters) {
  return useQuery({
    queryKey: ['leaderboards', 'list', filters],
    queryFn: () => leaderboardsApi.list(filters),
  });
}

export function useMyLeaderboardRankings() {
  return useQuery({
    queryKey: ['leaderboards', 'me'],
    queryFn: () => leaderboardsApi.getMyRankings(),
  });
}
