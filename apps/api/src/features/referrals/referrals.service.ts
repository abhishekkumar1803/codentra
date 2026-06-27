import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReferralStatus, Role, type User } from '@prisma/client';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import type {
  CreateReferralDto,
  ListReferralsQueryDto,
  UpdateReferralDto,
} from './dto/referral.dto';

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  async listReferrals(query: ListReferralsQueryDto, userId?: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      deletedAt: null,
      status: query.status ?? ReferralStatus.OPEN,
      ...(query.company
        ? { company: { contains: query.company, mode: 'insensitive' as const } }
        : {}),
      ...(query.search
        ? {
            OR: [
              {
                company: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                roleTitle: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                description: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [referrals, total] = await Promise.all([
      this.prisma.referral.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          referrer: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      this.prisma.referral.count({ where }),
    ]);

    return {
      items: referrals.map((r) => this.formatReferral(r, userId)),
      meta: { page, limit, total },
    };
  }

  async getReferralById(id: string, userId?: string) {
    const referral = await this.prisma.referral.findFirst({
      where: { id, deletedAt: null },
      include: {
        referrer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (!referral) {
      throw new NotFoundException('REFERRAL_NOT_FOUND');
    }

    return this.formatReferral(referral, userId);
  }

  async createReferral(user: User, dto: CreateReferralDto) {
    const referral = await this.prisma.referral.create({
      data: {
        referrerId: user.id,
        company: dto.company,
        roleTitle: dto.roleTitle,
        description: dto.description,
        requirements: dto.requirements,
        contactEmail: dto.contactEmail,
      },
      include: {
        referrer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return this.formatReferral(referral, user.id);
  }

  async updateReferral(id: string, user: User, dto: UpdateReferralDto) {
    const referral = await this.prisma.referral.findFirst({
      where: { id, deletedAt: null },
    });

    if (!referral) {
      throw new NotFoundException('REFERRAL_NOT_FOUND');
    }

    if (referral.referrerId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('FORBIDDEN');
    }

    const updated = await this.prisma.referral.update({
      where: { id },
      data: {
        ...(dto.company !== undefined ? { company: dto.company } : {}),
        ...(dto.roleTitle !== undefined ? { roleTitle: dto.roleTitle } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.requirements !== undefined
          ? { requirements: dto.requirements }
          : {}),
        ...(dto.contactEmail !== undefined
          ? { contactEmail: dto.contactEmail }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
      include: {
        referrer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return this.formatReferral(updated, user.id);
  }

  async deleteReferral(id: string, user: User) {
    const referral = await this.prisma.referral.findFirst({
      where: { id, deletedAt: null },
    });

    if (!referral) {
      throw new NotFoundException('REFERRAL_NOT_FOUND');
    }

    if (referral.referrerId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('FORBIDDEN');
    }

    await this.prisma.referral.update({
      where: { id },
      data: { deletedAt: new Date(), status: ReferralStatus.CLOSED },
    });

    return { message: 'Referral closed.' };
  }

  async expressInterest(id: string, user: User, message?: string) {
    const referral = await this.prisma.referral.findFirst({
      where: { id, deletedAt: null, status: ReferralStatus.OPEN },
    });

    if (!referral) {
      throw new NotFoundException('REFERRAL_NOT_FOUND');
    }

    if (referral.referrerId === user.id) {
      throw new ForbiddenException(
        'Cannot express interest on your own referral.',
      );
    }

    const interestMessage =
      message?.trim() ||
      `${user.name} is interested in your ${referral.roleTitle} referral at ${referral.company}.`;

    await this.prisma.notification.create({
      data: {
        userId: referral.referrerId,
        type: NotificationType.SYSTEM,
        title: 'New referral interest',
        body: interestMessage,
        metadata: { referralId: referral.id, interestedUserId: user.id },
      },
    });

    const mailtoSubject = encodeURIComponent(
      `Referral interest: ${referral.roleTitle} at ${referral.company}`,
    );
    const mailtoBody = encodeURIComponent(
      `Hi,\n\nI'm interested in the ${referral.roleTitle} role at ${referral.company} that you posted on Codentra.\n\n${message?.trim() ?? ''}\n\nThanks!`,
    );

    return {
      message: 'Interest sent! The referrer has been notified.',
      contactEmail: referral.contactEmail,
      mailtoLink: referral.contactEmail
        ? `mailto:${referral.contactEmail}?subject=${mailtoSubject}&body=${mailtoBody}`
        : null,
    };
  }

  async listMyReferrals(userId: string, query: ListReferralsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      referrerId: userId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };

    const [referrals, total] = await Promise.all([
      this.prisma.referral.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          referrer: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      this.prisma.referral.count({ where }),
    ]);

    return {
      items: referrals.map((r) => this.formatReferral(r, userId)),
      meta: { page, limit, total },
    };
  }

  private formatReferral(
    referral: {
      id: string;
      company: string;
      roleTitle: string;
      description: string;
      requirements: string | null;
      status: ReferralStatus;
      contactEmail: string | null;
      createdAt: Date;
      updatedAt: Date;
      referrer: { id: string; name: string; avatarUrl: string | null };
    },
    userId?: string,
  ) {
    const isOwner = userId === referral.referrer.id;
    return {
      id: referral.id,
      company: referral.company,
      roleTitle: referral.roleTitle,
      description: referral.description,
      requirements: referral.requirements,
      status: referral.status,
      contactEmail: isOwner ? referral.contactEmail : null,
      referrer: referral.referrer,
      isOwner,
      createdAt: referral.createdAt,
      updatedAt: referral.updatedAt,
    };
  }
}
