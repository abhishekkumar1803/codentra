import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { AdminJobsController } from './admin-jobs.controller';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  controllers: [JobsController, AdminJobsController],
  providers: [JobsService, RolesGuard, SubscriptionGuard],
  exports: [JobsService],
})
export class JobsModule {}
