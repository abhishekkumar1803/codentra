'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contestsApi, type ContestFilters } from '../api/contests-api';

export function useContests(filters?: ContestFilters) {
  return useQuery({
    queryKey: ['contests', 'list', filters],
    queryFn: () => contestsApi.list(filters),
  });
}

export function useContest(slug: string) {
  return useQuery({
    queryKey: ['contests', 'detail', slug],
    queryFn: () => contestsApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useContestParticipants(contestId: string | undefined) {
  return useQuery({
    queryKey: ['contests', 'participants', contestId],
    queryFn: () => contestsApi.getParticipants(contestId!),
    enabled: !!contestId,
  });
}

export function useJoinContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contestId: string) => contestsApi.join(contestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
  });
}
