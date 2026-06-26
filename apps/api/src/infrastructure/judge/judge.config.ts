import type { ConfigService } from '@nestjs/config';
import type { JudgeProvider } from './judge.types';

export type Judge0Settings = {
  provider: JudgeProvider;
  apiUrl: string;
  apiKey?: string;
};

export function resolveJudge0Settings(config: ConfigService): Judge0Settings {
  const providerRaw = config.get<string>('JUDGE_PROVIDER', 'judge0');
  const provider: JudgeProvider = providerRaw === 'mock' ? 'mock' : 'judge0';

  if (provider !== 'judge0') {
    return { provider, apiUrl: '' };
  }

  const apiUrl = config.get<string>('JUDGE0_API_URL')?.trim();
  if (!apiUrl) {
    throw new Error(
      'JUDGE0_API_URL is required when JUDGE_PROVIDER=judge0. ' +
        'Local dev: http://localhost:2358 (run `pnpm judge:up`).',
    );
  }

  const apiKey = config.get<string>('JUDGE0_API_KEY')?.trim() || undefined;

  return { provider, apiUrl, apiKey };
}
