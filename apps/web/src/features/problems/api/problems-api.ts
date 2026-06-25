import type { RunCodeResult } from '@codentra/types';
import { api } from '@/shared/lib/api-client';

export const problemsApi = {
  list: (contestSlug: string) =>
    api.get<{ items: import('@codentra/types').ProblemListItem[] }>(
      `/contests/${contestSlug}/problems`,
    ),

  get: (contestSlug: string, problemSlug: string) =>
    api.get<import('@codentra/types').ProblemDetail>(
      `/contests/${contestSlug}/problems/${problemSlug}`,
    ),

  run: (
    contestSlug: string,
    problemSlug: string,
    body: {
      language: string;
      sourceCode: string;
      input?: string;
      runSamples?: boolean;
    },
  ) =>
    api.post<RunCodeResult>(
      `/contests/${contestSlug}/problems/${problemSlug}/run`,
      body,
    ),

  submit: (
    contestSlug: string,
    problemSlug: string,
    body: { language: string; sourceCode: string },
  ) =>
    api.post<import('@codentra/types').CodeSubmission>(
      `/contests/${contestSlug}/problems/${problemSlug}/submit`,
      body,
    ),

  listSubmissions: (contestSlug: string, problemSlug: string) =>
    api.get<{
      items: import('@codentra/types').CodeSubmission[];
      meta: { total: number };
    }>(`/contests/${contestSlug}/problems/${problemSlug}/submissions`),

  getSubmission: (
    contestSlug: string,
    problemSlug: string,
    submissionId: string,
  ) =>
    api.get<import('@codentra/types').CodeSubmission>(
      `/contests/${contestSlug}/problems/${problemSlug}/submissions/${submissionId}`,
    ),
};
