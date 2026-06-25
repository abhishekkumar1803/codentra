import { Module } from '@nestjs/common';
import { RazorpayModule } from '../razorpay/razorpay.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [RazorpayModule, SubscriptionModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
