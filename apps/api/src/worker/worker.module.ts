import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../common/database/prisma.module';
import { JudgeModule } from '../infrastructure/judge/judge.module';
import { SubmissionJudgeQueueService } from '../infrastructure/queue/submission-judge.queue';

/** Minimal Nest context for a dedicated BullMQ submission worker process. */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    JudgeModule,
  ],
  providers: [SubmissionJudgeQueueService],
})
export class WorkerAppModule {}
