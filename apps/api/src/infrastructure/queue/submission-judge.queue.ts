import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import { SubmissionJudgingService } from '../judge/submission-judging.service';
import {
  SUBMISSION_JUDGE_QUEUE,
  type SubmissionJudgeJobData,
} from './queue.constants';

@Injectable()
export class SubmissionJudgeQueueService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(SubmissionJudgeQueueService.name);
  private connection: ConnectionOptions | null = null;
  private queue: Queue<SubmissionJudgeJobData> | null = null;
  private worker: Worker<SubmissionJudgeJobData> | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly judging: SubmissionJudgingService,
  ) {}

  isEnabled(): boolean {
    return !!this.config.get<string>('REDIS_URL');
  }

  onModuleInit() {
    const redisUrl = this.config.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.warn(
        'REDIS_URL not set — submissions judged synchronously in API process',
      );
      return;
    }

    try {
      this.connection = {
        url: redisUrl,
        maxRetriesPerRequest: null,
      };

      this.queue = new Queue<SubmissionJudgeJobData>(SUBMISSION_JUDGE_QUEUE, {
        connection: this.connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 500,
          removeOnFail: 1000,
        },
      });

      const runWorker =
        this.config.get<string>('ENABLE_SUBMISSION_WORKER', 'true') === 'true';

      if (runWorker) {
        const concurrency = Number(
          this.config.get<string>('SUBMISSION_WORKER_CONCURRENCY', '5'),
        );

        this.worker = new Worker<SubmissionJudgeJobData>(
          SUBMISSION_JUDGE_QUEUE,
          async (job) => {
            await this.judging.processSubmission(job.data.submissionId);
          },
          {
            connection: { ...this.connection },
            concurrency,
          },
        );

        this.worker.on('failed', (job, err) => {
          this.logger.error(
            `Submission job ${job?.id} failed: ${err.message}`,
            err.stack,
          );
        });

        this.worker.on('error', (err) => {
          this.logger.error(`Submission worker error: ${err.message}`, err.stack);
        });

        this.logger.log(
          `Submission judge worker started (concurrency=${concurrency})`,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Redis error';
      this.logger.error(
        `BullMQ init failed — async submits disabled. Check REDIS_URL (use rediss:// for Upstash). ${message}`,
      );
      this.connection = null;
      this.queue = null;
      this.worker = null;
    }
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.queue?.close();
  }

  async enqueue(submissionId: string): Promise<void> {
    if (!this.queue) {
      await this.judging.processSubmission(submissionId);
      return;
    }

    await this.queue.add(
      'judge',
      { submissionId },
      { jobId: `submission-${submissionId}` },
    );
  }
}
