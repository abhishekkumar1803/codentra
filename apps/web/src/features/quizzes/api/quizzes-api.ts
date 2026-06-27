import type { QuizResult, QuizSession } from '@codentra/types';
import { api } from '@/shared/lib/api-client';

export type SubmitQuizPayload = {
  answers: { questionId: string; optionId: string }[];
};

export const quizzesApi = {
  getSession: (slug: string) => api.get<QuizSession>(`/contests/${slug}/quiz`),

  submit: (contestId: string, payload: SubmitQuizPayload) =>
    api.post<QuizResult>(`/contests/${contestId}/quiz/submit`, payload),

  getResults: (contestId: string) =>
    api.get<QuizResult>(`/contests/${contestId}/quiz/results`),
};
