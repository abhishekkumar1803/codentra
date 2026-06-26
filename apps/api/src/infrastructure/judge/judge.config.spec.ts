import { ConfigService } from '@nestjs/config';
import { resolveJudge0Settings } from './judge.config';

describe('resolveJudge0Settings', () => {
  const mockConfig = (values: Record<string, string | undefined>) =>
    ({
      get: (key: string, defaultValue?: string) =>
        values[key] ?? defaultValue,
    }) as ConfigService;

  it('defaults to mock when JUDGE_PROVIDER is unset and no URL', () => {
    expect(resolveJudge0Settings(mockConfig({}))).toEqual({
      provider: 'mock',
      apiUrl: '',
    });
  });

  it('returns mock only when JUDGE_PROVIDER=mock', () => {
    expect(
      resolveJudge0Settings(mockConfig({ JUDGE_PROVIDER: 'mock' })),
    ).toEqual({ provider: 'mock', apiUrl: '' });
  });

  it('falls back to mock when judge0 provider is set without JUDGE0_API_URL', () => {
    expect(
      resolveJudge0Settings(mockConfig({ JUDGE_PROVIDER: 'judge0' })),
    ).toEqual({ provider: 'mock', apiUrl: '' });
  });

  it('reads URL and optional key from environment', () => {
    expect(
      resolveJudge0Settings(
        mockConfig({
          JUDGE_PROVIDER: 'judge0',
          JUDGE0_API_URL: 'http://localhost:2358',
          JUDGE0_API_KEY: 'secret',
        }),
      ),
    ).toEqual({
      provider: 'judge0',
      apiUrl: 'http://localhost:2358',
      apiKey: 'secret',
    });
  });

  it('omits empty API key', () => {
    expect(
      resolveJudge0Settings(
        mockConfig({
          JUDGE_PROVIDER: 'judge0',
          JUDGE0_API_URL: 'https://judge.example.com',
          JUDGE0_API_KEY: '',
        }),
      ),
    ).toEqual({
      provider: 'judge0',
      apiUrl: 'https://judge.example.com',
      apiKey: undefined,
    });
  });
});
