import { Module } from '@nestjs/common';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminContestsController } from './admin-contests.controller';
import { ContestsController } from './contests.controller';
import { ContestsService } from './contests.service';

@Module({
  controllers: [ContestsController, AdminContestsController],
  providers: [ContestsService, RolesGuard, SubscriptionGuard],
  exports: [ContestsService],
})
export class ContestsModule {}
