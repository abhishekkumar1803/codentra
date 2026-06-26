import { Module } from '@nestjs/common';
import { JudgeModule } from '../judge/judge.module';
import { SubmissionJudgeQueueService } from './submission-judge.queue';

@Module({
  imports: [JudgeModule],
  providers: [SubmissionJudgeQueueService],
  exports: [SubmissionJudgeQueueService, JudgeModule],
})
export class QueueModule {}
