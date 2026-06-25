import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';

export type LogActivityInput = {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class ActivityLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: LogActivityInput) {
    return this.prisma.activityLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata ?? undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }

  async list(query: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    from?: string;
    to?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const where = {
      ...(query.action ? { action: query.action } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      items: items.map((log) => ({
        id: log.id,
        userId: log.userId,
        userName: log.user?.name ?? null,
        userEmail: log.user?.email ?? null,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      })),
      meta: { page, limit, total },
    };
  }
}
