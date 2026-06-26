import type { CodeLanguage, SubmissionVerdict } from '@prisma/client';

export type JudgeRunResult = {
  verdict: SubmissionVerdict;
  output: string;
  runtimeMs: number;
  message?: string;
};

export type JudgeRunParams = {
  sourceCode: string;
  language: CodeLanguage;
  input: string;
  expectedOutput: string;
  timeLimitMs: number;
  memoryMb: number;
};

export type JudgeProvider = 'mock' | 'judge0';
