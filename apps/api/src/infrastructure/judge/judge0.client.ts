import { SubmissionVerdict } from '@prisma/client';
import type { JudgeRunParams, JudgeRunResult } from './judge.types';
import { toJudge0LanguageId } from './language-map';

type Judge0Status = {
  id: number;
  description: string;
};

type Judge0Submission = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: Judge0Status | null;
  time: string | null;
  memory: number | null;
};

export class Judge0Client {
  constructor(
    private readonly baseUrl: string,
    private readonly authToken?: string,
  ) {}

  async runTestCase(params: JudgeRunParams): Promise<JudgeRunResult> {
    const start = Date.now();
    const body = {
      source_code: params.sourceCode,
      language_id: toJudge0LanguageId(params.language),
      stdin: params.input,
      expected_output: normalizeExpectedOutput(params.expectedOutput),
      cpu_time_limit: Math.max(params.timeLimitMs / 1000, 0.1),
      memory_limit: params.memoryMb * 1024,
    };

    const url = new URL('/submissions', this.baseUrl.replace(/\/$/, ''));
    url.searchParams.set('base64_encoded', 'false');
    url.searchParams.set('wait', 'true');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers['X-Auth-Token'] = this.authToken;
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(params.timeLimitMs + 15_000),
      });
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : 'connection failed';
      return {
        verdict: SubmissionVerdict.RUNTIME_ERROR,
        output: '',
        runtimeMs: Date.now() - start,
        message: `Judge0 unreachable at ${this.baseUrl} (${detail}). Run: pnpm judge:up`,
      };
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return {
        verdict: SubmissionVerdict.RUNTIME_ERROR,
        output: '',
        runtimeMs: Date.now() - start,
        message: text || `Judge0 HTTP ${response.status}`,
      };
    }

    const submission = (await response.json()) as Judge0Submission;
    return mapJudge0Submission(submission, start);
  }
}

/** Judge0 compares stdout to expected_output exactly; programs usually print trailing newline. */
function normalizeExpectedOutput(expected: string): string {
  if (!expected) return expected;
  return expected.endsWith('\n') ? expected : `${expected}\n`;
}

export function mapJudge0Submission(
  submission: Judge0Submission,
  startMs: number,
): JudgeRunResult {
  const runtimeMs = submission.time
    ? Math.round(parseFloat(submission.time) * 1000)
    : Date.now() - startMs;

  const statusId = submission.status?.id ?? 13;
  const stdout = (submission.stdout ?? '').trim();
  const compileOutput = submission.compile_output?.trim();

  if (statusId === 6) {
    return {
      verdict: SubmissionVerdict.COMPILATION_ERROR,
      output: compileOutput || submission.message || 'Compilation failed.',
      runtimeMs,
      message: compileOutput || submission.message || undefined,
    };
  }

  if (statusId === 5) {
    return {
      verdict: SubmissionVerdict.TIME_LIMIT_EXCEEDED,
      output: stdout,
      runtimeMs,
    };
  }

  if (statusId === 3) {
    return {
      verdict: SubmissionVerdict.ACCEPTED,
      output: stdout,
      runtimeMs,
    };
  }

  if (statusId === 4) {
    return {
      verdict: SubmissionVerdict.WRONG_ANSWER,
      output: stdout,
      runtimeMs,
    };
  }

  if (statusId >= 7 && statusId <= 12) {
    return {
      verdict: SubmissionVerdict.RUNTIME_ERROR,
      output: submission.stderr?.trim() || stdout,
      runtimeMs,
      message: submission.message || submission.status?.description,
    };
  }

  // Status 13 = Internal Error (common on macOS Docker without cgroup v1)
  if (statusId === 13) {
    return {
      verdict: SubmissionVerdict.RUNTIME_ERROR,
      output: submission.stderr?.trim() || stdout,
      runtimeMs,
      message:
        submission.message ||
        'Judge0 internal error — see infra/judge0/README.md (macOS cgroup fix)',
    };
  }

  return {
    verdict: SubmissionVerdict.RUNTIME_ERROR,
    output: submission.stderr?.trim() || stdout,
    runtimeMs,
    message: submission.message || submission.status?.description,
  };
}
