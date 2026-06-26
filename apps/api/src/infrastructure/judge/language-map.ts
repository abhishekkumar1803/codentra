import type { CodeLanguage } from '@prisma/client';

/** Judge0 CE language IDs — https://ce.judge0.com/languages */
export const JUDGE0_LANGUAGE_IDS: Record<CodeLanguage, number> = {
  PYTHON: 71,
  CPP: 54,
  JAVA: 62,
  JAVASCRIPT: 63,
};

export function toJudge0LanguageId(language: CodeLanguage): number {
  const id = JUDGE0_LANGUAGE_IDS[language];
  if (!id) {
    throw new Error(`Unsupported language for Judge0: ${language}`);
  }
  return id;
}
