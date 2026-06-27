'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminContestsApi,
  type AdminContestFilters,
  type CreateContestPayload,
  type UpdateContestPayload,
} from '../api/admin-contests-api';

export function useAdminContests(filters?: AdminContestFilters) {
  return useQuery({
    queryKey: ['admin', 'contests', filters],
    queryFn: () => adminContestsApi.list(filters),
  });
}

export function useAdminContest(id: string) {
  return useQuery({
    queryKey: ['admin', 'contests', id],
    queryFn: () => adminContestsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateContestPayload) =>
      adminContestsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'contests'] });
    },
  });
}

export function useUpdateContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateContestPayload;
    }) => adminContestsApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'contests'] });
      void queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
  });
}

export function useDeleteContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminContestsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'contests'] });
    },
  });
}

export function useAdminQuizQuestions(contestId: string, enabled = true) {
  return useQuery({
    queryKey: ['admin', 'quiz-questions', contestId],
    queryFn: () => adminContestsApi.listQuizQuestions(contestId),
    enabled: !!contestId && enabled,
  });
}

export function useCreateQuizQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      contestId,
      payload,
    }: {
      contestId: string;
      payload: {
        text: string;
        points?: number;
        orderIndex: number;
        options: { text: string; isCorrect: boolean; orderIndex: number }[];
      };
    }) => adminContestsApi.createQuizQuestion(contestId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'quiz-questions'],
      });
    },
  });
}

export function useDeleteQuizQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      contestId,
      questionId,
    }: {
      contestId: string;
      questionId: string;
    }) => adminContestsApi.deleteQuizQuestion(contestId, questionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'quiz-questions'],
      });
    },
  });
}
