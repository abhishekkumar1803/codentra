import { Module } from '@nestjs/common';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { SystemDesignController } from './system-design.controller';
import { SystemDesignService } from './system-design.service';

@Module({
  controllers: [SystemDesignController],
  providers: [SystemDesignService, SubscriptionGuard],
  exports: [SystemDesignService],
})
export class SystemDesignModule {}
