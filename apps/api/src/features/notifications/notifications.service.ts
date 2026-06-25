import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import type { ListNotificationsQueryDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListNotificationsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      userId,
      ...(query.unreadOnly ? { readAt: null } : {}),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, readAt: null },
      }),
    ]);

    return {
      items: notifications.map((n) => this.formatNotification(n)),
      meta: { page, limit, total, unreadCount },
    };
  }

  async markRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('NOTIFICATION_NOT_FOUND');
    }

    if (notification.readAt) {
      return this.formatNotification(notification);
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });

    return this.formatNotification(updated);
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return { markedCount: result.count };
  }

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        metadata: metadata ?? undefined,
      },
    });

    return this.formatNotification(notification);
  }

  private formatNotification(notification: {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    readAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }
}
