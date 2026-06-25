import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { PrismaModule } from './common/database/prisma.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { EmailModule } from './infrastructure/email/email.module';
import { ActivityLogsModule } from './features/activity-logs/activity-logs.module';
import { AdminModule } from './features/admin/admin.module';
import { AuthModule } from './features/auth/auth.module';
import { ContestsModule } from './features/contests/contests.module';
import { LeaderboardsModule } from './features/leaderboards/leaderboards.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { JobsModule } from './features/jobs/jobs.module';
import { ReferralsModule } from './features/referrals/referrals.module';
import { ProblemsModule } from './features/problems/problems.module';
import { ServicesModule } from './features/services/services.module';
import { SystemDesignModule } from './features/system-design/system-design.module';
import { PaymentModule } from './features/payment/payment.module';
import { QuizzesModule } from './features/quizzes/quizzes.module';
import { SubscriptionModule } from './features/subscription/subscription.module';
import { UsersModule } from './features/users/users.module';
import { WebhookModule } from './features/webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    EmailModule,
    ActivityLogsModule,
    AuthModule,
    UsersModule,
    ContestsModule,
    QuizzesModule,
    LeaderboardsModule,
    NotificationsModule,
    AdminModule,
    JobsModule,
    ReferralsModule,
    ProblemsModule,
    ServicesModule,
    SystemDesignModule,
    SubscriptionModule,
    PaymentModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
