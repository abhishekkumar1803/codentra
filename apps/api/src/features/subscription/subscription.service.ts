import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { BusinessException } from '../../common/exceptions/business.exception';
import { EmailService } from '../../infrastructure/email/email.service';
import { RazorpayService } from '../razorpay/razorpay.service';
import type { CreateSubscriptionDto } from './dto/subscription.dto';

const MEMBERSHIP_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpay: RazorpayService,
    private readonly emailService: EmailService,
  ) {}

  async getMySubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    return subscription ? this.formatSubscription(subscription) : null;
  }

  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    const existing = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (
      existing &&
      (existing.status === SubscriptionStatus.ACTIVE ||
        existing.status === SubscriptionStatus.PENDING ||
        existing.status === SubscriptionStatus.PAST_DUE)
    ) {
      throw new ConflictException('SUBSCRIPTION_EXISTS');
    }

    const planId = dto.planId ?? this.razorpay.getPlanId();
    const razorpaySub = await this.razorpay.createSubscription(planId);
    const now = new Date();
    const periodEnd = new Date(now.getTime() + MEMBERSHIP_DURATION_MS);

    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        status: SubscriptionStatus.PENDING,
        razorpaySubscriptionId: razorpaySub.id,
        razorpayPlanId: planId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      update: {
        status: SubscriptionStatus.PENDING,
        razorpaySubscriptionId: razorpaySub.id,
        razorpayPlanId: planId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelledAt: null,
      },
    });

    if (this.razorpay.isMockMode()) {
      await this.activateSubscription(subscription.id, {
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        amount: this.razorpay.getMembershipAmount(),
      });
    }

    const updated = await this.prisma.subscription.findUnique({
      where: { id: subscription.id },
    });

    return {
      subscriptionId: updated!.id,
      razorpaySubscriptionId: razorpaySub.id,
      razorpayKeyId: this.razorpay.getKeyId(),
      amount: this.razorpay.getMembershipAmount(),
      currency: 'INR',
    };
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('SUBSCRIPTION_NOT_FOUND');
    }

    if (
      subscription.status !== SubscriptionStatus.ACTIVE &&
      subscription.status !== SubscriptionStatus.PAST_DUE
    ) {
      throw new BusinessException(
        'INVALID_SUBSCRIPTION_STATE',
        'Only active subscriptions can be cancelled',
      );
    }

    if (subscription.razorpaySubscriptionId) {
      await this.razorpay.cancelSubscription(
        subscription.razorpaySubscriptionId,
      );
    }

    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    return { subscription: this.formatSubscription(updated) };
  }

  async activateSubscription(
    subscriptionId: string,
    payment: { razorpayPaymentId: string; amount: number },
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription) return;

    const now = new Date();
    const periodEnd = new Date(now.getTime() + MEMBERSHIP_DURATION_MS);

    await this.prisma.$transaction([
      this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      }),
      this.prisma.payment.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          type: 'SUBSCRIPTION',
          amount: payment.amount,
          currency: 'INR',
          status: 'SUCCESS',
          razorpayPaymentId: payment.razorpayPaymentId,
          paidAt: now,
        },
      }),
    ]);

    const user = await this.prisma.user.findUnique({
      where: { id: subscription.userId },
    });
    if (user) {
      void this.emailService.sendSubscriptionConfirmation(
        user.email,
        user.name,
      );
    }
  }

  async handleWebhookEvent(event: {
    event: string;
    payload: Record<string, unknown>;
  }) {
    const eventType = event.event;
    const payload = event.payload;

    if (eventType === 'subscription.activated') {
      const entity = (
        payload as { subscription?: { entity?: Record<string, string> } }
      ).subscription?.entity;
      if (!entity?.id) return;
      const sub = await this.prisma.subscription.findFirst({
        where: { razorpaySubscriptionId: entity.id },
      });
      if (sub) {
        const paymentEntity = (
          payload as { payment?: { entity?: Record<string, string> } }
        ).payment?.entity;
        await this.activateSubscription(sub.id, {
          razorpayPaymentId: paymentEntity?.id ?? `pay_${Date.now()}`,
          amount: parseInt(paymentEntity?.amount ?? '4900', 10),
        });
      }
    }

    if (eventType === 'subscription.charged') {
      const paymentEntity = (
        payload as { payment?: { entity?: Record<string, string> } }
      ).payment?.entity;
      const subEntity = (
        payload as { subscription?: { entity?: Record<string, string> } }
      ).subscription?.entity;
      if (!paymentEntity?.id || !subEntity?.id) return;

      const sub = await this.prisma.subscription.findFirst({
        where: { razorpaySubscriptionId: subEntity.id },
      });
      if (!sub) return;

      const existing = await this.prisma.payment.findUnique({
        where: { razorpayPaymentId: paymentEntity.id },
      });
      if (existing) return;

      const now = new Date();
      const periodEnd = new Date(now.getTime() + MEMBERSHIP_DURATION_MS);

      await this.prisma.$transaction([
        this.prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
          },
        }),
        this.prisma.payment.create({
          data: {
            userId: sub.userId,
            subscriptionId: sub.id,
            type: 'SUBSCRIPTION',
            amount: parseInt(paymentEntity.amount ?? '4900', 10),
            currency: 'INR',
            status: 'SUCCESS',
            razorpayPaymentId: paymentEntity.id,
            paidAt: now,
          },
        }),
      ]);
    }

    if (eventType === 'subscription.cancelled') {
      const entity = (
        payload as { subscription?: { entity?: Record<string, string> } }
      ).subscription?.entity;
      if (!entity?.id) return;
      await this.prisma.subscription.updateMany({
        where: { razorpaySubscriptionId: entity.id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });
    }

    if (eventType === 'subscription.completed') {
      const entity = (
        payload as { subscription?: { entity?: Record<string, string> } }
      ).subscription?.entity;
      if (!entity?.id) return;
      await this.prisma.subscription.updateMany({
        where: { razorpaySubscriptionId: entity.id },
        data: { status: SubscriptionStatus.EXPIRED },
      });
    }

    if (eventType === 'payment.failed') {
      const entity = (
        payload as { payment?: { entity?: Record<string, string> } }
      ).payment?.entity;
      if (!entity?.id) return;

      const existing = await this.prisma.payment.findUnique({
        where: { razorpayPaymentId: entity.id },
      });
      if (existing) return;

      const sub = entity.subscription_id
        ? await this.prisma.subscription.findFirst({
            where: { razorpaySubscriptionId: entity.subscription_id },
          })
        : null;
      if (!sub) return;

      await this.prisma.payment.create({
        data: {
          userId: sub.userId,
          subscriptionId: sub.id,
          type: 'SUBSCRIPTION',
          amount: parseInt(entity.amount ?? '4900', 10),
          currency: 'INR',
          status: 'FAILED',
          razorpayPaymentId: entity.id,
        },
      });
    }
  }

  private formatSubscription(sub: {
    id: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelledAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: sub.id,
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelledAt: sub.cancelledAt,
      createdAt: sub.createdAt,
    };
  }
}
