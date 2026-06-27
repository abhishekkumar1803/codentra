'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { problemsApi } from '../api/problems-api';

export function useContestProblems(contestSlug: string) {
  return useQuery({
    queryKey: ['problems', contestSlug],
    queryFn: () => problemsApi.list(contestSlug),
    enabled: !!contestSlug,
  });
}

export function useProblem(
  contestSlug: string,
  problemSlug: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['problems', contestSlug, problemSlug],
    queryFn: () => problemsApi.get(contestSlug, problemSlug),
    enabled: (options?.enabled ?? true) && !!contestSlug && !!problemSlug,
  });
}

export function useProblemSubmissions(
  contestSlug: string,
  problemSlug: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['problems', contestSlug, problemSlug, 'submissions'],
    queryFn: () => problemsApi.listSubmissions(contestSlug, problemSlug),
    enabled: (options?.enabled ?? true) && !!contestSlug && !!problemSlug,
    refetchInterval: (query) => {
      const hasPending = query.state.data?.items.some(
        (s) => s.verdict === 'PENDING',
      );
      return hasPending ? 2000 : false;
    },
  });
}

export function useSubmission(
  contestSlug: string,
  problemSlug: string,
  submissionId: string | null,
) {
  return useQuery({
    queryKey: [
      'problems',
      contestSlug,
      problemSlug,
      'submission',
      submissionId,
    ],
    queryFn: () =>
      problemsApi.getSubmission(contestSlug, problemSlug, submissionId!),
    enabled: !!contestSlug && !!problemSlug && !!submissionId,
    refetchInterval: (query) => {
      const verdict = query.state.data?.verdict;
      return verdict === 'PENDING' ? 1500 : false;
    },
  });
}

export function useRunCode(contestSlug: string, problemSlug: string) {
  return useMutation({
    mutationFn: (body: {
      language: string;
      sourceCode: string;
      input?: string;
      runSamples?: boolean;
    }) => problemsApi.run(contestSlug, problemSlug, body),
  });
}

export function useSubmitCode(contestSlug: string, problemSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { language: string; sourceCode: string }) =>
      problemsApi.submit(contestSlug, problemSlug, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['problems', contestSlug, problemSlug, 'submissions'],
      });
      queryClient.setQueryData(
        ['problems', contestSlug, problemSlug, 'submission', data.id],
        data,
      );
      if (data.verdict === 'PENDING') {
        queryClient.invalidateQueries({
          queryKey: [
            'problems',
            contestSlug,
            problemSlug,
            'submission',
            data.id,
          ],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ['problems', contestSlug, problemSlug],
        });
        queryClient.invalidateQueries({
          queryKey: ['contests', contestSlug],
        });
      }
    },
  });
}
