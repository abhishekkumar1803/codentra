import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import Razorpay from 'razorpay';

export type RazorpaySubscriptionResponse = {
  id: string;
  status: string;
  plan_id: string;
  current_start?: number;
  current_end?: number;
};

@Injectable()
export class RazorpayService {
  private client: Razorpay | null = null;

  constructor(private readonly config: ConfigService) {
    const keyId = this.config.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.config.get<string>('RAZORPAY_KEY_SECRET');
    if (keyId && keySecret) {
      this.client = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
  }

  isMockMode(): boolean {
    return (
      this.config.get('RAZORPAY_MOCK', 'false') === 'true' || !this.client
    );
  }

  getKeyId(): string {
    return this.config.get('RAZORPAY_KEY_ID', 'rzp_test_mock');
  }

  getMembershipAmount(): number {
    return parseInt(this.config.get('MEMBERSHIP_AMOUNT_PAISE', '4900'), 10);
  }

  getPlanId(): string {
    return this.config.get('RAZORPAY_PLAN_ID', 'plan_membership_monthly');
  }

  async createSubscription(
    planId: string,
  ): Promise<RazorpaySubscriptionResponse> {
    if (this.isMockMode()) {
      return {
        id: `sub_mock_${Date.now()}`,
        status: 'created',
        plan_id: planId,
      };
    }

    const subscription = await this.client!.subscriptions.create({
      plan_id: planId,
      total_count: 120,
      customer_notify: 1,
    });

    return subscription as RazorpaySubscriptionResponse;
  }

  async cancelSubscription(razorpaySubscriptionId: string): Promise<void> {
    if (this.isMockMode()) return;
    await this.client!.subscriptions.cancel(razorpaySubscriptionId, false);
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const secret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!secret || this.isMockMode()) return true;

    const expected = createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    return expected === signature;
  }
}
