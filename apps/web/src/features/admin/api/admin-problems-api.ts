import { api } from '@/shared/lib/api-client';

export type AdminProblem = {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  points: number;
  orderIndex: number;
  testCases: {
    id: string;
    input: string;
    output: string;
    isSample: boolean;
    orderIndex: number;
  }[];
  _count: { submissions: number };
};

export const adminProblemsApi = {
  list: (contestId: string) =>
    api.get<{ items: AdminProblem[] }>(
      `/admin/contests/${contestId}/problems`,
    ),

  create: (
    contestId: string,
    payload: {
      title: string;
      description: string;
      inputFormat: string;
      outputFormat: string;
      difficulty?: string;
      points?: number;
    },
  ) => api.post(`/admin/contests/${contestId}/problems`, payload),

  addTestCase: (
    contestId: string,
    problemId: string,
    payload: { input: string; output: string; isSample?: boolean },
  ) =>
    api.post(
      `/admin/contests/${contestId}/problems/${problemId}/test-cases`,
      payload,
    ),

  deleteProblem: (contestId: string, problemId: string) =>
    api.delete(`/admin/contests/${contestId}/problems/${problemId}`),

  deleteTestCase: (
    contestId: string,
    problemId: string,
    testCaseId: string,
  ) =>
    api.delete(
      `/admin/contests/${contestId}/problems/${problemId}/test-cases/${testCaseId}`,
    ),
};
