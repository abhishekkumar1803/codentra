'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizzesApi, type SubmitQuizPayload } from '../api/quizzes-api';

export function useQuizSession(slug: string, enabled = true) {
  return useQuery({
    queryKey: ['quizzes', 'session', slug],
    queryFn: () => quizzesApi.getSession(slug),
    enabled: !!slug && enabled,
    retry: false,
  });
}

export function useQuizResults(contestId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['quizzes', 'results', contestId],
    queryFn: () => quizzesApi.getResults(contestId!),
    enabled: !!contestId && enabled,
    retry: false,
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      contestId,
      payload,
    }: {
      contestId: string;
      payload: SubmitQuizPayload;
    }) => quizzesApi.submit(contestId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      void queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
  });
}
