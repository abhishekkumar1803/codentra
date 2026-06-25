import { Module } from '@nestjs/common';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { LeaderboardsModule } from '../leaderboards/leaderboards.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminQuizzesController } from './admin-quizzes.controller';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

@Module({
  imports: [NotificationsModule, LeaderboardsModule],
  controllers: [QuizzesController, AdminQuizzesController],
  providers: [QuizzesService, RolesGuard, SubscriptionGuard],
  exports: [QuizzesService],
})
export class QuizzesModule {}
