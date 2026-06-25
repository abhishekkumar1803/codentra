import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionStatus } from '@prisma/client';
import { REQUIRE_SUBSCRIPTION_KEY } from '../decorators/require-subscription.decorator';
import { BusinessException } from '../exceptions/business.exception';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_SUBSCRIPTION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const request = context.switchToHttp().getRequest<{ user?: { id: string } }>();
    const userId = request.user?.id;
    if (!userId) return false;

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    const active =
      subscription?.status === SubscriptionStatus.ACTIVE ||
      subscription?.status === SubscriptionStatus.CANCELLED;

    if (!active) {
      throw new BusinessException(
        'SUBSCRIPTION_REQUIRED',
        'Active subscription required',
        403,
      );
    }

    return true;
  }
}
