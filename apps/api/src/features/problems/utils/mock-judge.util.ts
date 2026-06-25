import { SubmissionVerdict } from '@prisma/client';

export type JudgeResult = {
  verdict: SubmissionVerdict;
  output: string;
  runtimeMs: number;
};

/**
 * Local dev mock judge — evaluates stdin-style I/O problems (e.g. sum two integers).
 * Production would delegate to Judge0 or similar sandbox.
 */
export function mockJudge(
  sourceCode: string,
  input: string,
  expectedOutput: string,
  timeLimitMs = 2000,
): JudgeResult {
  const start = Date.now();

  if (!sourceCode.trim()) {
    return {
      verdict: SubmissionVerdict.COMPILATION_ERROR,
      output: '',
      runtimeMs: Date.now() - start,
    };
  }

  if (detectTimeLimitExceeded(sourceCode, input, timeLimitMs)) {
    return {
      verdict: SubmissionVerdict.TIME_LIMIT_EXCEEDED,
      output: '',
      runtimeMs: timeLimitMs + 1,
    };
  }

  try {
    const output = simulateIoProblem(input);
    const normalizedOutput = output.trim();
    const normalizedExpected = expectedOutput.trim();

    return {
      verdict:
        normalizedOutput === normalizedExpected
          ? SubmissionVerdict.ACCEPTED
          : SubmissionVerdict.WRONG_ANSWER,
      output: normalizedOutput,
      runtimeMs: Date.now() - start + 5,
    };
  } catch {
    return {
      verdict: SubmissionVerdict.RUNTIME_ERROR,
      output: '',
      runtimeMs: Date.now() - start,
    };
  }
}

function detectTimeLimitExceeded(
  sourceCode: string,
  input: string,
  timeLimitMs: number,
): boolean {
  if (/while\s*\(\s*true\s*\)/i.test(sourceCode)) {
    return true;
  }

  const nums = input
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  const magnitude = nums.reduce((max, n) => Math.max(max, Math.abs(n)), 0);
  const loopCount =
    (sourceCode.match(/\bfor\b/g)?.length ?? 0) +
    (sourceCode.match(/\bwhile\b/g)?.length ?? 0);

  if (magnitude >= 10_000 && loopCount >= 2) {
    return true;
  }

  void timeLimitMs;
  return false;
}

function simulateIoProblem(input: string): string {
  const parts = input.trim().split(/\s+/).map(Number);
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) {
    throw new Error('Invalid input');
  }
  return String(parts[0]! + parts[1]!);
}
