import type { SystemDesignChallenge } from '@codentra/types';
import { api } from '@/shared/lib/api-client';

export const systemDesignApi = {
  getChallenge: (slug: string) =>
    api.get<SystemDesignChallenge>(`/contests/${slug}/system-design`),

  submit: (
    contestId: string,
    payload: { solution: string; diagramUrl?: string },
  ) =>
    api.post<{
      id: string;
      contestId: string;
      solution: string;
      diagramUrl: string | null;
      submittedAt: string;
    }>(`/contests/${contestId}/system-design/submit`, payload),
};
