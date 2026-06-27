import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CodeLanguage } from '@prisma/client';
import { mockJudge } from '../../features/problems/utils/mock-judge.util';
import { resolveJudge0Settings } from './judge.config';
import { Judge0Client } from './judge0.client';
import type {
  JudgeProvider,
  JudgeRunParams,
  JudgeRunResult,
} from './judge.types';

@Injectable()
export class JudgeService implements OnModuleInit {
  private readonly logger = new Logger(JudgeService.name);
  private readonly provider: JudgeProvider;
  private readonly judge0?: Judge0Client;

  constructor(private readonly config: ConfigService) {
    const settings = resolveJudge0Settings(config);
    this.provider = settings.provider;

    if (this.provider === 'judge0') {
      this.judge0 = new Judge0Client(settings.apiUrl, settings.apiKey);
    }
  }

  onModuleInit() {
    const requested = this.config.get<string>('JUDGE_PROVIDER', 'judge0');
    if (requested === 'judge0' && this.provider === 'mock') {
      this.logger.warn(
        'JUDGE_PROVIDER=judge0 but JUDGE0_API_URL is unset — using mock judge until Judge0 is configured',
      );
      return;
    }

    if (this.provider === 'judge0' && this.judge0) {
      const apiUrl = resolveJudge0Settings(this.config).apiUrl;
      this.logger.log(`Judge provider: Judge0 CE at ${apiUrl}`);
      return;
    }

    this.logger.warn(
      'Judge provider: mock — set JUDGE_PROVIDER=judge0 and JUDGE0_API_URL for real execution',
    );
  }

  getProvider(): JudgeProvider {
    return this.provider;
  }

  async runTestCase(params: JudgeRunParams): Promise<JudgeRunResult> {
    if (this.provider === 'judge0' && this.judge0) {
      return this.judge0.runTestCase(params);
    }

    const result = mockJudge(
      params.sourceCode,
      params.input,
      params.expectedOutput,
      params.timeLimitMs,
    );

    return {
      verdict: result.verdict,
      output: result.output,
      runtimeMs: result.runtimeMs,
    };
  }

  async runTestCases(
    sourceCode: string,
    language: CodeLanguage,
    testCases: { input: string; output: string }[],
    timeLimitMs: number,
    memoryMb: number,
  ): Promise<JudgeRunResult[]> {
    const results: JudgeRunResult[] = [];
    for (const tc of testCases) {
      results.push(
        await this.runTestCase({
          sourceCode,
          language,
          input: tc.input,
          expectedOutput: tc.output,
          timeLimitMs,
          memoryMb,
        }),
      );
    }
    return results;
  }
}
