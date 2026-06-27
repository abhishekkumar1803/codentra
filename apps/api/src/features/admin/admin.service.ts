import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PaymentStatus,
  Prisma,
  Role,
  SubscriptionStatus,
} from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import type {
  AdminActivityLogsQueryDto,
  AdminPaymentsQueryDto,
  AdminSubscriptionsQueryDto,
  AdminUsersQueryDto,
  UpdateAdminUserDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  async getDashboardMetrics() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeSubscribers,
      newUsersThisMonth,
      cancelledThisMonth,
      activeStartOfMonth,
      monthlyRevenue,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: monthStart }, deletedAt: null },
      }),
      this.prisma.subscription.count({
        where: {
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: { gte: monthStart },
        },
      }),
      this.prisma.subscription.count({
        where: {
          status: SubscriptionStatus.ACTIVE,
          createdAt: { lt: monthStart },
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.SUCCESS,
          type: 'SUBSCRIPTION',
          paidAt: { gte: monthStart },
        },
        _sum: { amount: true },
      }),
    ]);

    const churnRate =
      activeStartOfMonth > 0 ? cancelledThisMonth / activeStartOfMonth : 0;

    return {
      totalUsers,
      activeSubscribers,
      monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
      newUsersThisMonth,
      churnRate: Math.round(churnRate * 1000) / 1000,
    };
  }

  async listUsers(query: AdminUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      deletedAt: null,
      ...(query.role ? { role: query.role } : {}),
      ...(query.status === 'active' ? { isActive: true } : {}),
      ...(query.status === 'inactive' ? { isActive: false } : {}),
      ...(query.search
        ? {
            OR: [
              {
                name: { contains: query.search, mode: 'insensitive' as const },
              },
              {
                email: { contains: query.search, mode: 'insensitive' as const },
              },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { subscription: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        subscriptionStatus: u.subscription?.status ?? null,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
      })),
      meta: { page, limit, total },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        subscription: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 20 },
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      profile: user.profile,
      subscription: user.subscription
        ? {
            id: user.subscription.id,
            status: user.subscription.status,
            currentPeriodStart: user.subscription.currentPeriodStart,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            cancelledAt: user.subscription.cancelledAt,
          }
        : null,
      payments: user.payments.map((p) => ({
        id: p.id,
        type: p.type,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
    };
  }

  async updateUser(id: string, dto: UpdateAdminUserDto, adminId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    if (dto.role && dto.role !== Role.ADMIN && user.role === Role.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: { role: Role.ADMIN, deletedAt: null, isActive: true },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('CANNOT_DEMOTE_LAST_ADMIN');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    await this.activityLogs.log({
      userId: adminId,
      action: 'admin.user.update',
      entityType: 'user',
      entityId: id,
      metadata: { changes: dto } as unknown as Prisma.InputJsonValue,
    });

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      isActive: updated.isActive,
    };
  }

  async listSubscriptions(query: AdminSubscriptionsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      items: items.map((s) => ({
        id: s.id,
        userId: s.userId,
        userName: s.user.name,
        userEmail: s.user.email,
        status: s.status,
        currentPeriodStart: s.currentPeriodStart,
        currentPeriodEnd: s.currentPeriodEnd,
        cancelledAt: s.cancelledAt,
        createdAt: s.createdAt,
      })),
      meta: { page, limit, total },
    };
  }

  async listPayments(query: AdminPaymentsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      items: items.map((p) => ({
        id: p.id,
        userId: p.userId,
        userName: p.user.name,
        userEmail: p.user.email,
        type: p.type,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      meta: { page, limit, total },
    };
  }

  async listActivityLogs(query: AdminActivityLogsQueryDto) {
    return this.activityLogs.list(query);
  }
}
