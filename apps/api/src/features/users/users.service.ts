import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { RatingType, type User } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { BusinessException } from '../../common/exceptions/business.exception';
import {
  comparePassword,
  hashPassword,
} from '../../common/utils/hash.util';
import { getRatingTitle } from '../../common/utils/rating.util';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';
import type { ChangePasswordDto, UpdateProfileDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getStats(userId: string) {
    const [user, contestsJoined, quizzesCompleted, globalRank] =
      await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true, profile: true },
      }),
      this.prisma.contestParticipant.count({ where: { userId } }),
      this.prisma.contestParticipant.count({
        where: {
          userId,
          status: 'SUBMITTED',
          contest: { type: 'QUIZ' },
        },
      }),
      this.getGlobalRank(userId),
    ]);

    const dsaRating = user?.profile?.dsaRating ?? 1200;
    const cpRating = user?.profile?.cpRating ?? 1200;

    return {
      contestsJoined,
      contestsWon: 0,
      quizzesCompleted,
      currentStreak: 0,
      dsaRating,
      cpRating,
      dsaTitle: getRatingTitle(dsaRating, RatingType.DSA),
      cpTitle: getRatingTitle(cpRating, RatingType.CP),
      globalRank,
      subscriptionStatus: user?.subscription?.status ?? null,
    };
  }

  async getRatingHistory(userId: string, type?: RatingType) {
    const entries = await this.prisma.ratingHistory.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return {
      items: entries.map((e) => ({
        id: e.id,
        type: e.type,
        rating: e.rating,
        delta: e.delta,
        reason: e.reason,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  }

  async getContestHistory(userId: string) {
    const participants = await this.prisma.contestParticipant.findMany({
      where: { userId },
      include: {
        contest: {
          select: {
            title: true,
            type: true,
            slug: true,
            startTime: true,
            status: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
      take: 100,
    });

    return {
      items: participants.map((p) => ({
        id: p.id,
        contestId: p.contestId,
        contestTitle: p.contest.title,
        contestSlug: p.contest.slug,
        contestType: p.contest.type,
        contestStatus: p.contest.status,
        startTime: p.contest.startTime.toISOString(),
        participantStatus: p.status,
        score: p.score,
        rank: p.rank,
        joinedAt: p.joinedAt.toISOString(),
      })),
    };
  }

  private async getGlobalRank(userId: string) {
    const participants = await this.prisma.contestParticipant.groupBy({
      by: ['userId'],
      _sum: { score: true },
      orderBy: { _sum: { score: 'desc' } },
    });

    const index = participants.findIndex((p) => p.userId === userId);
    return index >= 0 ? index + 1 : null;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { profile: true, subscription: true },
    });

    if (!user) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    return this.formatUserWithProfile(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { name, avatarUrl, bio, skills, githubUrl, linkedinUrl, twitterUrl, websiteUrl } =
      dto;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      },
    });

    const hasProfileFields =
      bio !== undefined ||
      skills !== undefined ||
      githubUrl !== undefined ||
      linkedinUrl !== undefined ||
      twitterUrl !== undefined ||
      websiteUrl !== undefined;

    if (hasProfileFields) {
      await this.prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          bio: bio ?? null,
          skills: skills ?? [],
          githubUrl: githubUrl ?? null,
          linkedinUrl: linkedinUrl ?? null,
          twitterUrl: twitterUrl ?? null,
          websiteUrl: websiteUrl ?? null,
        },
        update: {
          ...(bio !== undefined ? { bio } : {}),
          ...(skills !== undefined ? { skills } : {}),
          ...(githubUrl !== undefined ? { githubUrl } : {}),
          ...(linkedinUrl !== undefined ? { linkedinUrl } : {}),
          ...(twitterUrl !== undefined ? { twitterUrl } : {}),
          ...(websiteUrl !== undefined ? { websiteUrl } : {}),
        },
      });
    }

    return this.getProfile(userId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user?.passwordHash) {
      throw new BusinessException(
        'NO_PASSWORD',
        'Password login is not enabled for this account',
      );
    }

    const valid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('INVALID_CURRENT_PASSWORD');
    }

    const passwordHash = await hashPassword(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully.' };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file || file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('FILE_TOO_LARGE');
    }

    const avatarUrl = await this.cloudinary.uploadImage(file.buffer);
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return { avatarUrl };
  }

  private formatUserWithProfile(
    user: User & {
      profile: {
        bio: string | null;
        skills: string[];
        githubUrl: string | null;
        linkedinUrl: string | null;
        twitterUrl: string | null;
        websiteUrl: string | null;
      } | null;
      subscription: { status: string; currentPeriodEnd: Date } | null;
    },
  ) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      emailVerified: user.emailVerified,
      bio: user.profile?.bio ?? null,
      skills: user.profile?.skills ?? [],
      githubUrl: user.profile?.githubUrl ?? null,
      linkedinUrl: user.profile?.linkedinUrl ?? null,
      twitterUrl: user.profile?.twitterUrl ?? null,
      websiteUrl: user.profile?.websiteUrl ?? null,
      subscription: user.subscription
        ? {
            status: user.subscription.status,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
          }
        : null,
      createdAt: user.createdAt,
    };
  }
}
