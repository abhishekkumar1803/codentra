import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ContestStatus, ContestType, type User } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { BusinessException } from '../../common/exceptions/business.exception';
import type {
  CreateContestDto,
  ListContestsQueryDto,
  UpdateContestDto,
} from './dto/contest.dto';
import { uniqueSlug } from './utils/slug.util';

const PUBLIC_STATUSES: ContestStatus[] = [
  ContestStatus.SCHEDULED,
  ContestStatus.LIVE,
  ContestStatus.ENDED,
];

@Injectable()
export class ContestsService {
  constructor(private readonly prisma: PrismaService) {}

  async listContests(query: ListContestsQueryDto, userId?: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      deletedAt: null,
      status: { in: PUBLIC_STATUSES },
      ...(query.type ? { type: query.type } : {}),
      ...(query.excludeType && !query.type
        ? { type: { not: query.excludeType } }
        : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [contests, total] = await Promise.all([
      this.prisma.contest.findMany({
        where,
        orderBy: { startTime: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { participants: true } },
          participants: userId
            ? { where: { userId }, select: { id: true } }
            : false,
        },
      }),
      this.prisma.contest.count({ where }),
    ]);

    return {
      items: contests.map((c) => this.formatListItem(c, userId)),
      meta: { page, limit, total },
    };
  }

  async getContestBySlug(slug: string, userId?: string) {
    const contest = await this.prisma.contest.findFirst({
      where: {
        slug,
        deletedAt: null,
        status: { in: PUBLIC_STATUSES },
      },
      include: {
        _count: { select: { participants: true } },
        participants: userId
          ? {
              where: { userId },
              select: {
                id: true,
                status: true,
                joinedAt: true,
                isVirtual: true,
              },
            }
          : false,
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!contest) {
      throw new NotFoundException('CONTEST_NOT_FOUND');
    }

    return this.formatDetail(contest, userId);
  }

  async joinContest(contestId: string, user: User) {
    const contest = await this.prisma.contest.findFirst({
      where: { id: contestId, deletedAt: null },
      include: {
        _count: {
          select: {
            participants: { where: { isVirtual: false } },
          },
        },
      },
    });

    if (!contest) {
      throw new NotFoundException('CONTEST_NOT_FOUND');
    }

    const existing = await this.prisma.contestParticipant.findUnique({
      where: { contestId_userId: { contestId, userId: user.id } },
    });

    if (existing) {
      throw new ConflictException('ALREADY_REGISTERED');
    }

    const isVirtual = contest.status === ContestStatus.ENDED;

    if (!isVirtual) {
      if (
        contest.status !== ContestStatus.SCHEDULED &&
        contest.status !== ContestStatus.LIVE
      ) {
        throw new BusinessException(
          'CONTEST_NOT_JOINABLE',
          'Contest is not open for registration',
        );
      }

      if (
        contest.maxParticipants &&
        contest._count.participants >= contest.maxParticipants
      ) {
        throw new ConflictException('CONTEST_FULL');
      }
    }

    const participant = await this.prisma.contestParticipant.create({
      data: {
        contestId,
        userId: user.id,
        isVirtual,
      },
    });

    return {
      id: participant.id,
      contestId: participant.contestId,
      status: participant.status,
      isVirtual: participant.isVirtual,
      joinedAt: participant.joinedAt,
    };
  }

  async getParticipants(contestId: string, page = 1, limit = 50) {
    const contest = await this.prisma.contest.findFirst({
      where: { id: contestId, deletedAt: null },
    });

    if (!contest) {
      throw new NotFoundException('CONTEST_NOT_FOUND');
    }

    const where = { contestId, isVirtual: false };

    const [participants, total] = await Promise.all([
      this.prisma.contestParticipant.findMany({
        where,
        orderBy: [{ score: 'desc' }, { joinedAt: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      this.prisma.contestParticipant.count({ where }),
    ]);

    return {
      items: participants.map((p, index) => ({
        rank: (page - 1) * limit + index + 1,
        userId: p.user.id,
        userName: p.user.name,
        avatarUrl: p.user.avatarUrl,
        score: p.score,
        status: p.status,
        joinedAt: p.joinedAt,
      })),
      meta: { page, limit, total },
    };
  }

  // ── Admin ─────────────────────────────────────────

  async adminList(query: ListContestsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      deletedAt: null,
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [contests, total] = await Promise.all([
      this.prisma.contest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { participants: true } } },
      }),
      this.prisma.contest.count({ where }),
    ]);

    return {
      items: contests.map((c) => this.formatListItem(c)),
      meta: { page, limit, total },
    };
  }

  async adminGetById(id: string) {
    const contest = await this.prisma.contest.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: { select: { participants: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!contest) {
      throw new NotFoundException('CONTEST_NOT_FOUND');
    }

    return this.formatDetail(contest);
  }

  async adminCreate(dto: CreateContestDto, adminId: string) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('INVALID_CONTEST_TIMES');
    }

    const slug = await uniqueSlug(dto.title, async (s) => {
      const found = await this.prisma.contest.findUnique({
        where: { slug: s },
      });
      return !!found;
    });

    const contest = await this.prisma.contest.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        type: dto.type,
        status: ContestStatus.DRAFT,
        startTime,
        endTime,
        durationMinutes: dto.durationMinutes,
        maxParticipants: dto.maxParticipants,
        createdById: adminId,
      },
      include: { _count: { select: { participants: true } } },
    });

    return this.formatDetail(contest);
  }

  async adminUpdate(id: string, dto: UpdateContestDto) {
    const existing = await this.prisma.contest.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('CONTEST_NOT_FOUND');
    }

    if (dto.startTime && dto.endTime) {
      if (new Date(dto.endTime) <= new Date(dto.startTime)) {
        throw new BadRequestException('INVALID_CONTEST_TIMES');
      }
    }

    let slug = existing.slug;
    if (dto.title && dto.title !== existing.title) {
      slug = await uniqueSlug(dto.title, async (s) => {
        if (s === existing.slug) return false;
        const found = await this.prisma.contest.findUnique({
          where: { slug: s },
        });
        return !!found;
      });
    }

    const contest = await this.prisma.contest.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title, slug } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.startTime !== undefined
          ? { startTime: new Date(dto.startTime) }
          : {}),
        ...(dto.endTime !== undefined
          ? { endTime: new Date(dto.endTime) }
          : {}),
        ...(dto.durationMinutes !== undefined
          ? { durationMinutes: dto.durationMinutes }
          : {}),
        ...(dto.maxParticipants !== undefined
          ? { maxParticipants: dto.maxParticipants }
          : {}),
      },
      include: {
        _count: { select: { participants: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return this.formatDetail(contest);
  }

  async adminDelete(id: string) {
    const existing = await this.prisma.contest.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('CONTEST_NOT_FOUND');
    }

    await this.prisma.contest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Contest deleted.' };
  }

  private formatListItem(
    contest: {
      id: string;
      title: string;
      slug: string;
      type: ContestType;
      status: ContestStatus;
      startTime: Date;
      endTime: Date;
      durationMinutes: number;
      _count: { participants: number };
      participants?: { id: string }[];
    },
    userId?: string,
  ) {
    return {
      id: contest.id,
      title: contest.title,
      slug: contest.slug,
      type: contest.type,
      status: contest.status,
      startTime: contest.startTime,
      endTime: contest.endTime,
      durationMinutes: contest.durationMinutes,
      participantCount: contest._count.participants,
      isRegistered: userId
        ? (contest.participants?.length ?? 0) > 0
        : undefined,
    };
  }

  private formatDetail(
    contest: {
      id: string;
      title: string;
      slug: string;
      description: string;
      type: ContestType;
      status: ContestStatus;
      startTime: Date;
      endTime: Date;
      durationMinutes: number;
      maxParticipants: number | null;
      createdAt: Date;
      updatedAt: Date;
      _count: { participants: number };
      participants?: {
        id: string;
        status: string;
        joinedAt: Date;
        isVirtual: boolean;
      }[];
      createdBy?: { id: string; name: string };
    },
    userId?: string,
  ) {
    const registration = contest.participants?.[0];
    return {
      id: contest.id,
      title: contest.title,
      slug: contest.slug,
      description: contest.description,
      type: contest.type,
      status: contest.status,
      startTime: contest.startTime,
      endTime: contest.endTime,
      durationMinutes: contest.durationMinutes,
      maxParticipants: contest.maxParticipants,
      participantCount: contest._count.participants,
      createdBy: contest.createdBy,
      createdAt: contest.createdAt,
      updatedAt: contest.updatedAt,
      isRegistered: userId ? !!registration : undefined,
      registration: registration
        ? {
            status: registration.status,
            joinedAt: registration.joinedAt,
            isVirtual: registration.isVirtual,
          }
        : null,
    };
  }
}
