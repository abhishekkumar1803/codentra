'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { systemDesignApi } from '../api/system-design-api';

export function useSystemDesignChallenge(slug: string) {
  return useQuery({
    queryKey: ['system-design', slug],
    queryFn: () => systemDesignApi.getChallenge(slug),
    enabled: !!slug,
    retry: false,
  });
}

export function useSubmitSystemDesign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      contestId,
      payload,
    }: {
      contestId: string;
      payload: { solution: string; diagramUrl?: string };
    }) => systemDesignApi.submit(contestId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['system-design'] });
      void queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
  });
}
