import { Injectable, NotFoundException } from '@nestjs/common';
import {
  LeaderboardPeriod,
  ParticipantStatus,
} from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import type { ListLeaderboardQueryDto } from './dto/leaderboard.dto';

type AggregatedScore = {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  score: number;
};

@Injectable()
export class LeaderboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(query: ListLeaderboardQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const period = query.period ?? LeaderboardPeriod.ALL_TIME;

    if (query.contestId) {
      return this.getContestLeaderboard(query.contestId, page, limit);
    }

    const aggregated = await this.aggregateGlobalScores(period);
    const total = aggregated.length;
    const items = aggregated
      .slice((page - 1) * limit, page * limit)
      .map((entry, index) => ({
        rank: (page - 1) * limit + index + 1,
        userId: entry.userId,
        userName: entry.userName,
        avatarUrl: entry.avatarUrl,
        score: entry.score,
      }));

    return {
      items,
      meta: { period, page, limit, total },
    };
  }

  async getMyRankings(userId: string) {
    const periods = [
      LeaderboardPeriod.WEEKLY,
      LeaderboardPeriod.MONTHLY,
      LeaderboardPeriod.ALL_TIME,
    ];

    const rankings = await Promise.all(
      periods.map(async (period) => {
        const aggregated = await this.aggregateGlobalScores(period);
        const index = aggregated.findIndex((e) => e.userId === userId);
        return {
          period,
          rank: index >= 0 ? index + 1 : null,
          score: index >= 0 ? aggregated[index]!.score : 0,
          totalParticipants: aggregated.length,
        };
      }),
    );

    return { rankings };
  }

  async refreshGlobalLeaderboards() {
    const periods = [
      LeaderboardPeriod.WEEKLY,
      LeaderboardPeriod.MONTHLY,
      LeaderboardPeriod.ALL_TIME,
    ];

    for (const period of periods) {
      const aggregated = await this.aggregateGlobalScores(period);
      const { start, end } = this.getPeriodBounds(period);

      await this.prisma.$transaction(async (tx) => {
        await tx.leaderboardEntry.deleteMany({
          where: { period, contestId: null },
        });

        if (aggregated.length === 0) return;

        await tx.leaderboardEntry.createMany({
          data: aggregated.map((entry, index) => ({
            userId: entry.userId,
            contestId: null,
            period,
            score: entry.score,
            rank: index + 1,
            periodStart: start,
            periodEnd: end,
          })),
        });
      });
    }
  }

  private async getContestLeaderboard(
    contestId: string,
    page: number,
    limit: number,
  ) {
    const contest = await this.prisma.contest.findFirst({
      where: { id: contestId, deletedAt: null },
    });

    if (!contest) {
      throw new NotFoundException('CONTEST_NOT_FOUND');
    }

    const [participants, total] = await Promise.all([
      this.prisma.contestParticipant.findMany({
        where: { contestId, status: ParticipantStatus.SUBMITTED },
        orderBy: [{ score: 'desc' }, { submittedAt: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      this.prisma.contestParticipant.count({
        where: { contestId, status: ParticipantStatus.SUBMITTED },
      }),
    ]);

    return {
      items: participants.map((p, index) => ({
        rank: (page - 1) * limit + index + 1,
        userId: p.user.id,
        userName: p.user.name,
        avatarUrl: p.user.avatarUrl,
        score: p.score,
      })),
      meta: {
        period: LeaderboardPeriod.CONTEST,
        contestId,
        page,
        limit,
        total,
      },
    };
  }

  private async aggregateGlobalScores(
    period: LeaderboardPeriod,
  ): Promise<AggregatedScore[]> {
    const periodStart = this.getPeriodStart(period);

    const participants = await this.prisma.contestParticipant.findMany({
      where: {
        status: ParticipantStatus.SUBMITTED,
        ...(periodStart ? { submittedAt: { gte: periodStart } } : {}),
      },
      select: {
        userId: true,
        score: true,
        user: { select: { name: true, avatarUrl: true } },
      },
    });

    const scoreMap = new Map<string, AggregatedScore>();

    for (const p of participants) {
      const existing = scoreMap.get(p.userId);
      if (existing) {
        existing.score += p.score;
      } else {
        scoreMap.set(p.userId, {
          userId: p.userId,
          userName: p.user.name,
          avatarUrl: p.user.avatarUrl,
          score: p.score,
        });
      }
    }

    return [...scoreMap.values()].sort((a, b) => b.score - a.score);
  }

  private getPeriodStart(period: LeaderboardPeriod): Date | null {
    if (period === LeaderboardPeriod.ALL_TIME) return null;
    const now = new Date();
    if (period === LeaderboardPeriod.WEEKLY) {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    if (period === LeaderboardPeriod.MONTHLY) {
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return null;
  }

  private getPeriodBounds(period: LeaderboardPeriod) {
    const end = new Date();
    const start = this.getPeriodStart(period) ?? new Date(0);
    return { start, end };
  }
}
