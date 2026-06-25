import type { ContestDetail, ContestListItem } from '@codentra/types';
import { api } from '@/shared/lib/api-client';

export type AdminContestFilters = {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
};

export type CreateContestPayload = {
  title: string;
  description: string;
  type: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  maxParticipants?: number;
};

export type UpdateContestPayload = Partial<
  CreateContestPayload & { status: string }
>;

export type AdminQuizQuestion = {
  id: string;
  contestId: string;
  text: string;
  points: number;
  orderIndex: number;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    orderIndex: number;
  }[];
};

export const adminContestsApi = {
  list: (filters?: AdminContestFilters) => {
    const search = new URLSearchParams();
    if (filters?.page) search.set('page', String(filters.page));
    if (filters?.limit) search.set('limit', String(filters.limit));
    if (filters?.type) search.set('type', filters.type);
    if (filters?.status) search.set('status', filters.status);
    const qs = search.toString();
    return api.get<{
      items: ContestListItem[];
      meta: { page: number; limit: number; total: number };
    }>(`/admin/contests${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => api.get<ContestDetail>(`/admin/contests/${id}`),

  create: (payload: CreateContestPayload) =>
    api.post<ContestDetail>('/admin/contests', payload),

  update: (id: string, payload: UpdateContestPayload) =>
    api.patch<ContestDetail>(`/admin/contests/${id}`, payload),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/admin/contests/${id}`),

  listQuizQuestions: (contestId: string) =>
    api.get<{ items: AdminQuizQuestion[] }>(
      `/admin/contests/${contestId}/quiz/questions`,
    ),

  createQuizQuestion: (
    contestId: string,
    payload: {
      text: string;
      points?: number;
      orderIndex: number;
      options: { text: string; isCorrect: boolean; orderIndex: number }[];
    },
  ) =>
    api.post<AdminQuizQuestion>(
      `/admin/contests/${contestId}/quiz/questions`,
      payload,
    ),

  deleteQuizQuestion: (contestId: string, questionId: string) =>
    api.delete<{ message: string }>(
      `/admin/contests/${contestId}/quiz/questions/${questionId}`,
    ),
};
