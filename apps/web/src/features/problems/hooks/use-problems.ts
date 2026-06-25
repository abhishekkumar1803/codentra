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
    enabled:
      (options?.enabled ?? true) && !!contestSlug && !!problemSlug,
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
    enabled:
      (options?.enabled ?? true) && !!contestSlug && !!problemSlug,
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['problems', contestSlug, problemSlug, 'submissions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['problems', contestSlug, problemSlug],
      });
      queryClient.invalidateQueries({ queryKey: ['contests', contestSlug] });
    },
  });
}
