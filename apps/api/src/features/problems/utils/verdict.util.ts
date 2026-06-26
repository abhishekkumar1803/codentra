import { SubmissionVerdict } from '@prisma/client';

export type VerdictDetails = {
  failedTestIndex?: number;
  isHidden?: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  message?: string;
  passedCount?: number;
  totalCount?: number;
};

/** Hidden test case details are never exposed to contestants. */
export function sanitizeVerdictDetails(
  details: VerdictDetails | null | undefined,
): VerdictDetails | null {
  if (!details) return null;

  if (details.isHidden) {
    return {
      isHidden: true,
      message: details.message ?? 'Failed on hidden test case(s).',
      passedCount: details.passedCount,
      totalCount: details.totalCount,
    };
  }

  return details;
}

export type TestRunResult = {
  verdict: SubmissionVerdict;
  output: string;
  runtimeMs: number;
};

type TestCaseInput = { input: string; output: string; isSample: boolean };

export async function evaluateTestCasesAsync(
  testCases: TestCaseInput[],
  runCase: (tc: TestCaseInput) => Promise<TestRunResult>,
): Promise<{
  verdict: SubmissionVerdict;
  runtimeMs: number;
  details: VerdictDetails | null;
}> {
  let totalRuntime = 0;
  let pretestIndex = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i]!;
    if (tc.isSample) {
      pretestIndex += 1;
    }

    const result = await runCase(tc);
    totalRuntime += result.runtimeMs;

    if (result.verdict !== SubmissionVerdict.ACCEPTED) {
      const isHidden = !tc.isSample;
      const failedPretest = tc.isSample ? pretestIndex : undefined;
      const verdictMessage = buildFailureMessage(
        result.verdict,
        isHidden,
        failedPretest,
      );

      const details: VerdictDetails = {
        failedTestIndex: failedPretest,
        isHidden,
        passedCount: i,
        totalCount: testCases.length,
        message: verdictMessage,
      };

      if (!isHidden) {
        details.input = tc.input;
        details.expectedOutput = tc.output;
        details.actualOutput = result.output;
      }

      return {
        verdict: result.verdict,
        runtimeMs: totalRuntime,
        details,
      };
    }
  }

  return {
    verdict: SubmissionVerdict.ACCEPTED,
    runtimeMs: totalRuntime,
    details: {
      passedCount: testCases.length,
      totalCount: testCases.length,
      message: 'Accepted — all pretests and hidden tests passed.',
    },
  };
}

export function evaluateTestCases(
  sourceCode: string,
  testCases: TestCaseInput[],
  mockJudge: (
    code: string,
    input: string,
    expected: string,
    timeLimitMs?: number,
  ) => TestRunResult,
  timeLimitMs = 2000,
): {
  verdict: SubmissionVerdict;
  runtimeMs: number;
  details: VerdictDetails | null;
} {
  let totalRuntime = 0;
  let pretestIndex = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i]!;
    if (tc.isSample) {
      pretestIndex += 1;
    }

    const result = mockJudge(sourceCode, tc.input, tc.output, timeLimitMs);
    totalRuntime += result.runtimeMs;

    if (result.verdict !== SubmissionVerdict.ACCEPTED) {
      const isHidden = !tc.isSample;
      const failedPretest = tc.isSample ? pretestIndex : undefined;
      const verdictMessage = buildFailureMessage(
        result.verdict,
        isHidden,
        failedPretest,
      );

      const details: VerdictDetails = {
        failedTestIndex: failedPretest,
        isHidden,
        passedCount: i,
        totalCount: testCases.length,
        message: verdictMessage,
      };

      if (!isHidden) {
        details.input = tc.input;
        details.expectedOutput = tc.output;
        details.actualOutput = result.output;
      }

      return {
        verdict: result.verdict,
        runtimeMs: totalRuntime,
        details,
      };
    }
  }

  return {
    verdict: SubmissionVerdict.ACCEPTED,
    runtimeMs: totalRuntime,
    details: {
      passedCount: testCases.length,
      totalCount: testCases.length,
      message: 'Accepted — all pretests and hidden tests passed.',
    },
  };
}

/** Map judge run result to TestRunResult shape. */
export function toTestRunResult(result: TestRunResult): TestRunResult {
  return {
    verdict: result.verdict,
    output: result.output,
    runtimeMs: result.runtimeMs,
  };
}

function buildFailureMessage(
  verdict: SubmissionVerdict,
  isHidden: boolean,
  pretestIndex?: number,
): string {
  if (verdict === SubmissionVerdict.TIME_LIMIT_EXCEEDED) {
    return isHidden
      ? 'Time limit exceeded on hidden test case(s).'
      : `Time limit exceeded on pretest ${pretestIndex}.`;
  }

  if (verdict === SubmissionVerdict.RUNTIME_ERROR) {
    return isHidden
      ? 'Runtime error on hidden test case(s).'
      : `Runtime error on pretest ${pretestIndex}.`;
  }

  if (verdict === SubmissionVerdict.COMPILATION_ERROR) {
    return 'Compilation error.';
  }

  return isHidden
    ? 'Failed on hidden test case(s).'
    : `Wrong answer on pretest ${pretestIndex}.`;
}
