import { Module } from '@nestjs/common';
import { JudgeService } from './judge.service';
import { SubmissionJudgingService } from './submission-judging.service';

@Module({
  providers: [JudgeService, SubmissionJudgingService],
  exports: [JudgeService, SubmissionJudgingService],
})
export class JudgeModule {}
