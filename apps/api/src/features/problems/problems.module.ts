import { Module } from '@nestjs/common';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { QueueModule } from '../../infrastructure/queue/queue.module';
import { JudgeModule } from '../../infrastructure/judge/judge.module';
import { AdminProblemsController } from './admin-problems.controller';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';

@Module({
  imports: [JudgeModule, QueueModule],
  controllers: [ProblemsController, AdminProblemsController],
  providers: [ProblemsService, SubscriptionGuard, RolesGuard],
  exports: [ProblemsService],
})
export class ProblemsModule {}
