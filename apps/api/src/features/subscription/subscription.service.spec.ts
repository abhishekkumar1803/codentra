import { SubscriptionStatus } from '@prisma/client';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  it('reports no subscription when user has none', async () => {
    const prisma = {
      subscription: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    const razorpay = { getPlanId: jest.fn(), isMockMode: jest.fn() };
    const emailService = { sendSubscriptionConfirmation: jest.fn() };

    const service = new SubscriptionService(
      prisma as never,
      razorpay as never,
      emailService as never,
    );

    const result = await service.getMySubscription('user-1');
    expect(result).toBeNull();
  });

  it('formats active subscription response', async () => {
    const now = new Date('2025-06-01');
    const prisma = {
      subscription: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'sub-1',
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: now,
          cancelledAt: null,
          createdAt: now,
        }),
      },
    };
    const razorpay = { getPlanId: jest.fn(), isMockMode: jest.fn() };
    const emailService = { sendSubscriptionConfirmation: jest.fn() };

    const service = new SubscriptionService(
      prisma as never,
      razorpay as never,
      emailService as never,
    );

    const result = await service.getMySubscription('user-1');
    expect(result?.status).toBe('ACTIVE');
    expect(result?.id).toBe('sub-1');
  });
});
